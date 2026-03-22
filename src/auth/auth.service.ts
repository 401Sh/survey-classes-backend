import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { SignUpDto } from "./dto/signup.dto"
import { SignUpConfirmDto } from "./dto/signup-confirm.dto"
import { SignInDto } from "./dto/signin.dto"
import { UsersService } from "src/users/services/users.service"
import { MAIL_CONFIRMATION_CODE_LENGTH, MAIL_CONFIRMATION_CODE_TTL } from "src/common/constants/mail.constant"
import { type UserEntity } from "src/users/entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { CodeVerificationEntity } from "./entities/code-verification.entity"
import { Repository } from "typeorm"
import { MailService } from "src/mail/mail.service"
import { TokensService } from "./services/tokens.service"
import { randomInt } from "crypto"
import { VerificationType } from "./enums/verification-type.enum"
import { ForgotPasswordBodyDto } from "./dto/forgot-password-body.dto"
import { ForgotPasswordConfirmBodyDto } from "./dto/forgot-password-confirm-body.dto"
import { ResetPasswordBodyDto } from "./dto/reset-password-body.dto"

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(
        @InjectRepository(CodeVerificationEntity)
        private emailVerificationRepository: Repository<CodeVerificationEntity>,

        private usersService: UsersService,
        private mailService: MailService,
        private tokensService: TokensService,
    ) { }

    async signUp(data: SignUpDto) {
        const user = await this.usersService.findByEmail(data.email)

        if (!user) return await this.signUpNewUser(data)

        if (user && user.isEmailVerified) {
            throw new BadRequestException("A user with this email address is already registered")
        }
        
        return await this.resendSignUpCode(user)
    }


    private async signUpNewUser(data: SignUpDto) {
        const code = this.generateOtp(MAIL_CONFIRMATION_CODE_LENGTH)
        const hashedCode = await this.tokensService.hashData(code)
        const expiresAt = new Date(Date.now() + MAIL_CONFIRMATION_CODE_TTL)
    
        const newUser = await this.usersService.create(data)

        await this.emailVerificationRepository.save({
            user: newUser,
            code: hashedCode,
            type: VerificationType.EMAIL,
            expiresAt,
        })
    
        await this.mailService.sendUserConfirmation(newUser, code)
    
        return newUser
    }


    private async resendSignUpCode(user: UserEntity) {
        const code = this.generateOtp(MAIL_CONFIRMATION_CODE_LENGTH)
        const hashedCode = await this.tokensService.hashData(code)
        const expiresAt = new Date(Date.now() + MAIL_CONFIRMATION_CODE_TTL)
    
        const updateResult = await this.emailVerificationRepository.update({
            user: { id: user.id },
            type: VerificationType.EMAIL,
        }, {
            code: hashedCode,
            expiresAt: expiresAt,
        })

        if (updateResult.affected === 0) {
            await this.emailVerificationRepository.save({
                user,
                code: hashedCode,
                type: VerificationType.EMAIL,
                expiresAt,
            })
        }
    
        await this.mailService.sendUserConfirmation(user, code)
    
        return user
    }
    
    
    async confirmEmail(signUpConfirmDto: SignUpConfirmDto, userAgent: string, ip: string, fingerprint: string) {
        const user = await this.usersService.findByEmailWithVerification(signUpConfirmDto.email)

        if (!user) throw new NotFoundException("User does not exist")

        if (user.isEmailVerified) {
        throw new BadRequestException("Mail is already confirmed")
        }

        if (
            !user.emailVerification.expiresAt ||
            user.emailVerification.expiresAt < new Date()
        ) {
            throw new BadRequestException("Confirmation code has expired")
        }

        if (!user.emailVerification.code) {
            throw new BadRequestException("No confirmation code, sing up your account")
        }

        const isCodeValid = await this.tokensService.verifyData(
            signUpConfirmDto.code,
            user.emailVerification.code,
        )
        if (!isCodeValid) {
            this.logger.log(`Access denied for user: ${user.id}. Incorrect confirmation code`)
            throw new ForbiddenException("Confirmation Denied")
        }

        user.isEmailVerified = true

        await this.emailVerificationRepository.delete({
            user: { id: user.id },
            type: VerificationType.EMAIL,
        })

        await this.usersService.update(
            user.id,
            {
                isEmailVerified: true,
            },
        )

        if (!fingerprint) {
            throw new BadRequestException("Fingerprint header is required")
        }

        const tokens = await this.tokensService.createRefreshSession(
            user,
            userAgent,
            ip,
            fingerprint,
        )
        return tokens
    }
    
    
    async signIn(signInDto: SignInDto, userAgent: string, ip: string, fingerprint: string) {
        const user = await this.usersService.findByEmail(signInDto.email)

        if (!user) throw new BadRequestException("User does not exist")

        if (!user.isEmailVerified) {
            throw new BadRequestException("Mail does not verified")
        }

        if (!fingerprint) {
            throw new BadRequestException("Fingerprint header is required")
        }

        const isPasswordValid = await this.tokensService.verifyData(
            signInDto.password,
            user.password,
        )
        if (!isPasswordValid) {
            throw new BadRequestException("Password is incorrect")
        }

        const existiingSession = await this.tokensService.findRefreshSession(
            user.id,
            fingerprint,
        )

        if (existiingSession) {
            await this.tokensService.deleteRefreshSession(user.id, fingerprint)
        }

        const tokens = await this.tokensService.createRefreshSession(
            user,
            userAgent,
            ip,
            fingerprint,
        )
        return tokens
    }


    async forgotPassword(data: ForgotPasswordBodyDto) {
        const user = await this.usersService.findByEmail(data.email)

        // do not disclose whether the user exists
        if (!user || !user.isEmailVerified) return
    
        const code = this.generateOtp(MAIL_CONFIRMATION_CODE_LENGTH)
        const hashedCode = await this.tokensService.hashData(code)
        const expiresAt = new Date(Date.now() + MAIL_CONFIRMATION_CODE_TTL)
    
        const emailVerification = await this.emailVerificationRepository.findOne({
            where: {
                user: {
                    id: user.id,
                },
                type: VerificationType.PASSWORD_RESET,
            },
        })
    
        if (emailVerification) {
            await this.emailVerificationRepository.update(
                {
                    user: {
                        id: user.id,
                    },
                    type: VerificationType.PASSWORD_RESET,
                },
                {
                    code: hashedCode,
                    expiresAt,
                },
            )
        }

        await this.emailVerificationRepository.save({
            user,
            code: hashedCode,
            type: VerificationType.PASSWORD_RESET,
            expiresAt,
        })
    
        await this.mailService.sendPasswordReset(user, code)
    }


    async confirmForgotPassword(data: ForgotPasswordConfirmBodyDto) {
        const user = await this.usersService.findByEmail(data.email)
    
        if (!user) throw new NotFoundException("User does not exist")
    
        const passwordReset = await this.emailVerificationRepository.findOne({
            where: {
                user: {
                    id: user.id,
                },
                type: VerificationType.PASSWORD_RESET,
            },
        })
    
        if (!passwordReset) {
            throw new BadRequestException("No reset code found")
        }
    
        if (passwordReset.expiresAt < new Date()) {
            throw new BadRequestException("Reset code has expired")
        }
    
        const isCodeValid = await this.tokensService.verifyData(
            data.code,
            passwordReset.code,
        )
        if (!isCodeValid) {
            this.logger.log(`Access denied for user: ${user.id}. Incorrect reset code`)
            throw new ForbiddenException("Invalid reset code")
        }
    
        const resetToken = this.tokensService.signResetToken(user.id)
    
        await this.emailVerificationRepository.delete({
            user: {
                id: user.id,
            },
            type: VerificationType.PASSWORD_RESET,
        })
    
        return resetToken
    }


    async resetPassword(data: ResetPasswordBodyDto) {
        const userId = await this.tokensService.verifyResetToken(data.resetToken)
    
        if (!userId) throw new ForbiddenException("Invalid or expired reset token")
    
        const hashedPassword = await this.tokensService.hashData(data.password)
    
        await this.usersService.update(
            userId,
            { password: hashedPassword },
        )
    
        this.logger.log(`Password reset for user: ${userId}`)
    }
    
    
    async deleteSession(userId: number, fingerprint: string) {
        await this.tokensService.deleteRefreshSession(userId, fingerprint)
    }


    async refreshTokens(userId: number, refreshToken: string, userAgent: string, ip: string, fingerprint: string) {
        const user = await this.usersService.findByIdOrUnauthorized(userId)

        if (!fingerprint) {
            throw new BadRequestException("Fingerprint header is required")
        }

        // Verifing refresh token
        const session = await this.tokensService.findRefreshSession(user.id, fingerprint)

        if (!session) {
            this.logger.log(`Access denied for user: ${user.id}. No existing session`)
            throw new ForbiddenException("Access Denied")
        }

        // Check if token has expired
        const currentTime = new Date()
        if (session.expiresAt < currentTime) {
            this.logger.log(
                `Access denied for user: ${user.id}. Refresh token expired`,
            )
            throw new ForbiddenException("Refresh token expired")
        }

        const isTokenValid = await this.tokensService.verifyData(
            refreshToken,
            session.refreshToken,
        )

        if (!isTokenValid) {
            this.logger.log(`Access denied for user: ${user.id}. Incorrect refresh token`)
            throw new ForbiddenException("Access Denied")
        }

        await this.tokensService.deleteRefreshSession(user.id, fingerprint)

        // Create new refreshToken session
        const tokens = await this.tokensService.createRefreshSession(
            user,
            userAgent,
            ip,
            fingerprint,
        )
        return tokens
    }


    private generateOtp(length: number): string {
        return Array.from({ length }, () => randomInt(0, 10)).join("")
    }
}