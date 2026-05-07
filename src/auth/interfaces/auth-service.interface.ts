import { UserEntity } from "src/users/entities/user.entity"
import { ForgotPasswordBodyDto } from "../dto/forgot-password-body.dto"
import { ForgotPasswordConfirmBodyDto } from "../dto/forgot-password-confirm-body.dto"
import { JWTTokensReturnDto } from "../dto/jwt-tokens-return.dto"
import { ResetPasswordBodyDto } from "../dto/reset-password-body.dto"
import { SignInDto } from "../dto/signin.dto"
import { SignUpConfirmDto } from "../dto/signup-confirm.dto"
import { SignUpDto } from "../dto/signup.dto"

export interface IAuthService {
    signUp(data: SignUpDto): Promise<UserEntity>
    confirmEmail(
        signUpConfirmDto: SignUpConfirmDto,
        userAgent: string,
        ip: string,
        fingerprint: string,
    ): Promise<JWTTokensReturnDto>
    signIn(signInDto: SignInDto, userAgent: string, ip: string, fingerprint: string): Promise<JWTTokensReturnDto>
    forgotPassword(data: ForgotPasswordBodyDto): Promise<void>
    confirmForgotPassword(data: ForgotPasswordConfirmBodyDto): Promise<{ resetToken: string }>
    resetPassword(data: ResetPasswordBodyDto): Promise<void>
    deleteSession(userId: number, fingerprint: string): Promise<void>
    refreshTokens(
        userId: number,
        refreshToken: string,
        userAgent: string,
        ip: string,
        fingerprint: string,
    ): Promise<JWTTokensReturnDto>
}