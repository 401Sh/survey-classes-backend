import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { MailTemplate } from "src/common/enums/mail-template.enum"
import { MailService } from "src/mail/mail.service"
import { UserEntity } from "src/users/entities/user.entity"
import { UsersInternalService } from "src/users/services/users-internal.service"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { CodeVerificationEntity } from "../entities/code-verification.entity"
import { RefreshSessionEntity } from "../entities/refresh-session.entity"
import { VerificationType } from "../enums/verification-type.enum"
import { SignUpDto } from "../dto"
import { AuthService } from "../auth.service"
import { CryptoService } from "../services/crypto.service"
import { TokensService } from "../services/tokens.service"

const mockVerificationRepository = {
    save: vi.fn(),
    update: vi.fn(),
    findOne: vi.fn(),
    delete: vi.fn(),
}

const mockUsersService = {
    create: vi.fn(),
    findByEmailWithPass: vi.fn(),
    findByEmailWithVerification: vi.fn(),
    findByIdOrUnauthorized: vi.fn(),
    update: vi.fn(),
}

const mockMailService = {
    sendMail: vi.fn(),
}

const mockTokensService = {
    createRefreshSession: vi.fn(),
    findRefreshSession: vi.fn(),
    deleteRefreshSession: vi.fn(),
    signResetToken: vi.fn(),
    verifyResetToken: vi.fn(),
}

const mockCryptoService = {
    hashData: vi.fn(),
    verifyData: vi.fn(),
}

const fakeTokens = { accessToken: "access", refreshToken: "refresh" }

// время «в будущем» и «в прошлом» для проверки срока действия кодов
const inFuture = () => new Date(Date.now() + 60 * 1000)
const inPast = () => new Date(Date.now() - 60 * 1000)

describe("AuthService", () => {
    let service: AuthService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getRepositoryToken(CodeVerificationEntity), useValue: mockVerificationRepository },
                { provide: UsersInternalService, useValue: mockUsersService },
                { provide: MailService, useValue: mockMailService },
                { provide: TokensService, useValue: mockTokensService },
                { provide: CryptoService, useValue: mockCryptoService },
            ],
        }).compile()

        service = module.get(AuthService)

        mockCryptoService.hashData.mockResolvedValue("hashed")
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("signUp", () => {
        const dto = {
            email: "user@mail.com",
            password: "password",
            firstName: "Ivan",
            secondName: "Ivanov",
        } as SignUpDto

        it("should create new user and send confirmation code", async () => {
            const newUser = { id: 1, email: dto.email } as UserEntity
            mockUsersService.findByEmailWithPass.mockResolvedValue(null)
            mockUsersService.create.mockResolvedValue(newUser)

            const result = await service.signUp(dto)

            expect(result).toEqual(newUser)
            expect(mockUsersService.create).toHaveBeenCalledWith(dto)
            expect(mockMailService.sendMail).toHaveBeenCalledWith(
                MailTemplate.Confirmation,
                newUser,
                { code: expect.stringMatching(/^\d{6}$/) } // код из 6 цифр
            )
        })

        it("should save only hashed code, not the code from the email", async () => {
            const newUser = { id: 1 } as UserEntity
            mockUsersService.findByEmailWithPass.mockResolvedValue(null)
            mockUsersService.create.mockResolvedValue(newUser)

            await service.signUp(dto)

            const sentCode = mockMailService.sendMail.mock.calls[0][2].code
            expect(mockCryptoService.hashData).toHaveBeenCalledWith(sentCode)
            expect(mockVerificationRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: newUser,
                    code: "hashed",
                    type: VerificationType.EMAIL,
                })
            )
        })

        it("should throw BadRequestException when email is already registered and verified", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue({ id: 1, isEmailVerified: true })

            await expect(service.signUp(dto)).rejects.toThrow(BadRequestException)
            expect(mockUsersService.create).not.toHaveBeenCalled()
            expect(mockMailService.sendMail).not.toHaveBeenCalled()
        })

        it("should resend code when user exists but email is not verified", async () => {
            const existingUser = { id: 1, isEmailVerified: false } as UserEntity
            mockUsersService.findByEmailWithPass.mockResolvedValue(existingUser)
            mockVerificationRepository.update.mockResolvedValue({ affected: 1 })

            const result = await service.signUp(dto)

            expect(result).toEqual(existingUser)
            expect(mockUsersService.create).not.toHaveBeenCalled()
            expect(mockVerificationRepository.update).toHaveBeenCalled()
            expect(mockVerificationRepository.save).not.toHaveBeenCalled()
            expect(mockMailService.sendMail).toHaveBeenCalledWith(
                MailTemplate.Confirmation,
                existingUser,
                { code: expect.stringMatching(/^\d{6}$/) }
            )
        })

        it("should create new code record when unverified user has no code yet", async () => {
            const existingUser = { id: 1, isEmailVerified: false } as UserEntity
            mockUsersService.findByEmailWithPass.mockResolvedValue(existingUser)
            mockVerificationRepository.update.mockResolvedValue({ affected: 0 })

            await service.signUp(dto)

            expect(mockVerificationRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ user: existingUser, type: VerificationType.EMAIL })
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("confirmEmail", () => {
        const dto = { email: "user@mail.com", code: "123456" }

        const createUser = (overrides = {}) => ({
            id: 1,
            isEmailVerified: false,
            emailVerification: { code: "hashed-code", expiresAt: inFuture() },
            ...overrides,
        }) as UserEntity

        it("should confirm email and return tokens", async () => {
            const user = createUser()
            mockUsersService.findByEmailWithVerification.mockResolvedValue(user)
            mockCryptoService.verifyData.mockResolvedValue(true)
            mockTokensService.createRefreshSession.mockResolvedValue(fakeTokens)

            const result = await service.confirmEmail(dto, "agent", "127.0.0.1", "fp")

            expect(result).toEqual(fakeTokens)
            expect(mockCryptoService.verifyData).toHaveBeenCalledWith("123456", "hashed-code")
            expect(mockUsersService.update).toHaveBeenCalledWith(1, { isEmailVerified: true })
            expect(mockVerificationRepository.delete).toHaveBeenCalledWith({
                user: { id: 1 },
                type: VerificationType.EMAIL,
            })
            expect(mockTokensService.createRefreshSession).toHaveBeenCalledWith(user, "agent", "127.0.0.1", "fp")
        })

        it("should throw NotFoundException when user does not exist", async () => {
            mockUsersService.findByEmailWithVerification.mockResolvedValue(null)

            await expect(service.confirmEmail(dto, "agent", "ip", "fp")).rejects.toThrow(NotFoundException)
        })

        it("should throw BadRequestException when email is already confirmed", async () => {
            mockUsersService.findByEmailWithVerification.mockResolvedValue(createUser({ isEmailVerified: true }))

            await expect(service.confirmEmail(dto, "agent", "ip", "fp")).rejects.toThrow(BadRequestException)
        })

        it("should throw BadRequestException when code has expired", async () => {
            mockUsersService.findByEmailWithVerification.mockResolvedValue(
                createUser({ emailVerification: { code: "hashed-code", expiresAt: inPast() } })
            )

            await expect(service.confirmEmail(dto, "agent", "ip", "fp")).rejects.toThrow(BadRequestException)
            expect(mockUsersService.update).not.toHaveBeenCalled()
        })

        it("should throw BadRequestException when user has no code", async () => {
            mockUsersService.findByEmailWithVerification.mockResolvedValue(
                createUser({ emailVerification: { code: "", expiresAt: inFuture() } })
            )

            await expect(service.confirmEmail(dto, "agent", "ip", "fp")).rejects.toThrow(BadRequestException)
        })

        it("should throw ForbiddenException when code is incorrect", async () => {
            mockUsersService.findByEmailWithVerification.mockResolvedValue(createUser())
            mockCryptoService.verifyData.mockResolvedValue(false)

            await expect(service.confirmEmail(dto, "agent", "ip", "fp")).rejects.toThrow(ForbiddenException)
            expect(mockUsersService.update).not.toHaveBeenCalled()
            expect(mockTokensService.createRefreshSession).not.toHaveBeenCalled()
        })

        it("should throw BadRequestException when fingerprint is missing", async () => {
            mockUsersService.findByEmailWithVerification.mockResolvedValue(createUser())
            mockCryptoService.verifyData.mockResolvedValue(true)

            await expect(service.confirmEmail(dto, "agent", "ip", "")).rejects.toThrow(BadRequestException)
            expect(mockTokensService.createRefreshSession).not.toHaveBeenCalled()
        })

        it("should not confirm email when fingerprint is missing", async () => {
            mockUsersService.findByEmailWithVerification.mockResolvedValue(createUser())
            mockCryptoService.verifyData.mockResolvedValue(true)

            await expect(service.confirmEmail(dto, "agent", "ip", "")).rejects.toThrow(BadRequestException)

            // при ошибке пользователь не должен стать подтверждённым, а код не должен сгореть
            expect(mockUsersService.update).not.toHaveBeenCalled()
            expect(mockVerificationRepository.delete).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("signIn", () => {
        const dto = { email: "user@mail.com", password: "password" }
        const verifiedUser = { id: 1, isEmailVerified: true, password: "hashed-password" } as UserEntity

        it("should return tokens when credentials are correct", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue(verifiedUser)
            mockCryptoService.verifyData.mockResolvedValue(true)
            mockTokensService.findRefreshSession.mockResolvedValue(null)
            mockTokensService.createRefreshSession.mockResolvedValue(fakeTokens)

            const result = await service.signIn(dto, "agent", "127.0.0.1", "fp")

            expect(result).toEqual(fakeTokens)
            expect(mockCryptoService.verifyData).toHaveBeenCalledWith("password", "hashed-password")
            expect(mockTokensService.createRefreshSession).toHaveBeenCalledWith(
                verifiedUser,
                "agent",
                "127.0.0.1",
                "fp"
            )
            expect(mockTokensService.deleteRefreshSession).not.toHaveBeenCalled()
        })

        it("should replace old session of the same device", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue(verifiedUser)
            mockCryptoService.verifyData.mockResolvedValue(true)
            mockTokensService.findRefreshSession.mockResolvedValue({ id: 5 })
            mockTokensService.createRefreshSession.mockResolvedValue(fakeTokens)

            await service.signIn(dto, "agent", "127.0.0.1", "fp")

            expect(mockTokensService.deleteRefreshSession).toHaveBeenCalledWith(1, "fp")
            expect(mockTokensService.createRefreshSession).toHaveBeenCalled()
        })

        it("should throw BadRequestException when user does not exist", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue(null)

            await expect(service.signIn(dto, "agent", "ip", "fp")).rejects.toThrow(BadRequestException)
        })

        it("should throw BadRequestException when email is not verified", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue({ ...verifiedUser, isEmailVerified: false })

            await expect(service.signIn(dto, "agent", "ip", "fp")).rejects.toThrow(BadRequestException)
        })

        it("should throw BadRequestException when fingerprint is missing", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue(verifiedUser)

            await expect(service.signIn(dto, "agent", "ip", "")).rejects.toThrow(BadRequestException)
        })

        it("should throw BadRequestException when password is incorrect", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue(verifiedUser)
            mockCryptoService.verifyData.mockResolvedValue(false)

            await expect(service.signIn(dto, "agent", "ip", "fp")).rejects.toThrow(BadRequestException)
            expect(mockTokensService.createRefreshSession).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("forgotPassword", () => {
        const dto = { email: "user@mail.com" }
        const verifiedUser = { id: 1, isEmailVerified: true } as UserEntity

        it("should save new reset code and send email", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue(verifiedUser)
            mockVerificationRepository.findOne.mockResolvedValue(null)

            await service.forgotPassword(dto)

            expect(mockVerificationRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: verifiedUser,
                    code: "hashed",
                    type: VerificationType.PASSWORD_RESET,
                })
            )
            expect(mockMailService.sendMail).toHaveBeenCalledWith(
                MailTemplate.PasswordReset,
                verifiedUser,
                { code: expect.stringMatching(/^\d{6}$/) }
            )
        })

        it("should update existing reset code instead of creating a new one", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue(verifiedUser)
            mockVerificationRepository.findOne.mockResolvedValue({ id: 3 })

            await service.forgotPassword(dto)

            expect(mockVerificationRepository.update).toHaveBeenCalled()
            expect(mockVerificationRepository.save).not.toHaveBeenCalled()
            expect(mockMailService.sendMail).toHaveBeenCalled()
        })

        it("should do nothing when user does not exist", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue(null)

            await expect(service.forgotPassword(dto)).resolves.toBeUndefined()

            expect(mockMailService.sendMail).not.toHaveBeenCalled()
            expect(mockVerificationRepository.save).not.toHaveBeenCalled()
        })

        it("should do nothing when email is not verified", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue({ id: 1, isEmailVerified: false })

            await expect(service.forgotPassword(dto)).resolves.toBeUndefined()

            expect(mockMailService.sendMail).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("confirmForgotPassword", () => {
        const dto = { email: "user@mail.com", code: "123456" }

        it("should return reset token and delete used code", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue({ id: 1 })
            mockVerificationRepository.findOne.mockResolvedValue({ code: "hashed-code", expiresAt: inFuture() })
            mockCryptoService.verifyData.mockResolvedValue(true)
            mockTokensService.signResetToken.mockReturnValue("reset-token")

            const result = await service.confirmForgotPassword(dto)

            expect(result).toEqual({ resetToken: "reset-token" })
            expect(mockCryptoService.verifyData).toHaveBeenCalledWith("123456", "hashed-code")
            expect(mockTokensService.signResetToken).toHaveBeenCalledWith(1)
            expect(mockVerificationRepository.delete).toHaveBeenCalledWith({
                user: { id: 1 },
                type: VerificationType.PASSWORD_RESET,
            })
        })

        it("should throw NotFoundException when user does not exist", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue(null)

            await expect(service.confirmForgotPassword(dto)).rejects.toThrow(NotFoundException)
        })

        it("should throw BadRequestException when there is no reset code", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue({ id: 1 })
            mockVerificationRepository.findOne.mockResolvedValue(null)

            await expect(service.confirmForgotPassword(dto)).rejects.toThrow(BadRequestException)
        })

        it("should throw BadRequestException when reset code has expired", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue({ id: 1 })
            mockVerificationRepository.findOne.mockResolvedValue({ code: "hashed-code", expiresAt: inPast() })

            await expect(service.confirmForgotPassword(dto)).rejects.toThrow(BadRequestException)
            expect(mockTokensService.signResetToken).not.toHaveBeenCalled()
        })

        it("should throw ForbiddenException when code is incorrect", async () => {
            mockUsersService.findByEmailWithPass.mockResolvedValue({ id: 1 })
            mockVerificationRepository.findOne.mockResolvedValue({ code: "hashed-code", expiresAt: inFuture() })
            mockCryptoService.verifyData.mockResolvedValue(false)

            await expect(service.confirmForgotPassword(dto)).rejects.toThrow(ForbiddenException)
            expect(mockTokensService.signResetToken).not.toHaveBeenCalled()
            expect(mockVerificationRepository.delete).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("resetPassword", () => {
        const dto = { resetToken: "reset-token", password: "new-password" }

        it("should save hashed new password", async () => {
            mockTokensService.verifyResetToken.mockReturnValue(1)

            await service.resetPassword(dto)

            expect(mockTokensService.verifyResetToken).toHaveBeenCalledWith("reset-token")
            expect(mockCryptoService.hashData).toHaveBeenCalledWith("new-password")
            expect(mockUsersService.update).toHaveBeenCalledWith(1, { password: "hashed" })
        })

        it("should throw ForbiddenException when reset token is invalid", async () => {
            mockTokensService.verifyResetToken.mockReturnValue(null)

            await expect(service.resetPassword(dto)).rejects.toThrow(ForbiddenException)
            expect(mockUsersService.update).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("deleteSession", () => {
        it("should delete session of the user by fingerprint", async () => {
            await service.deleteSession(1, "fp")

            expect(mockTokensService.deleteRefreshSession).toHaveBeenCalledWith(1, "fp")
        })
    })

    // -------------------------------------------------------------------------

    describe("refreshTokens", () => {
        const user = { id: 1 } as UserEntity
        const validSession = { refreshToken: "hashed-refresh", expiresAt: inFuture() } as RefreshSessionEntity

        it("should replace old session with new one and return new tokens", async () => {
            mockUsersService.findByIdOrUnauthorized.mockResolvedValue(user)
            mockTokensService.findRefreshSession.mockResolvedValue(validSession)
            mockCryptoService.verifyData.mockResolvedValue(true)
            mockTokensService.createRefreshSession.mockResolvedValue(fakeTokens)

            const result = await service.refreshTokens(1, "refresh", "agent", "127.0.0.1", "fp")

            expect(result).toEqual(fakeTokens)
            expect(mockCryptoService.verifyData).toHaveBeenCalledWith("refresh", "hashed-refresh")
            expect(mockTokensService.deleteRefreshSession).toHaveBeenCalledWith(1, "fp")
            expect(mockTokensService.createRefreshSession).toHaveBeenCalledWith(user, "agent", "127.0.0.1", "fp")
        })

        it("should throw UnauthorizedException when user does not exist", async () => {
            mockUsersService.findByIdOrUnauthorized.mockRejectedValue(new UnauthorizedException())

            await expect(service.refreshTokens(99, "refresh", "agent", "ip", "fp")).rejects.toThrow(UnauthorizedException)
        })

        it("should throw BadRequestException when fingerprint is missing", async () => {
            mockUsersService.findByIdOrUnauthorized.mockResolvedValue(user)

            await expect(service.refreshTokens(1, "refresh", "agent", "ip", "")).rejects.toThrow(BadRequestException)
        })

        it("should throw ForbiddenException when session does not exist", async () => {
            mockUsersService.findByIdOrUnauthorized.mockResolvedValue(user)
            mockTokensService.findRefreshSession.mockResolvedValue(null)

            await expect(service.refreshTokens(1, "refresh", "agent", "ip", "fp")).rejects.toThrow(ForbiddenException)
        })

        it("should throw ForbiddenException when session has expired", async () => {
            mockUsersService.findByIdOrUnauthorized.mockResolvedValue(user)
            mockTokensService.findRefreshSession.mockResolvedValue({ ...validSession, expiresAt: inPast() })

            await expect(service.refreshTokens(1, "refresh", "agent", "ip", "fp")).rejects.toThrow(ForbiddenException)
            expect(mockTokensService.createRefreshSession).not.toHaveBeenCalled()
        })

        it("should throw ForbiddenException when refresh token is incorrect", async () => {
            mockUsersService.findByIdOrUnauthorized.mockResolvedValue(user)
            mockTokensService.findRefreshSession.mockResolvedValue(validSession)
            mockCryptoService.verifyData.mockResolvedValue(false)

            await expect(service.refreshTokens(1, "refresh", "agent", "ip", "fp")).rejects.toThrow(ForbiddenException)
            expect(mockTokensService.deleteRefreshSession).not.toHaveBeenCalled()
            expect(mockTokensService.createRefreshSession).not.toHaveBeenCalled()
        })
    })
})
