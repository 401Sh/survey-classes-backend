import { NotFoundException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { REFRESH_TOKEN_TTL } from "src/common/constants/jwt-token.constant"
import { UserEntity } from "src/users/entities/user.entity"
import { UserRole } from "src/users/enums/user-role.enum"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { RefreshSessionEntity } from "../entities/refresh-session.entity"
import { CryptoService } from "../services/crypto.service"
import { TokensService } from "../services/tokens.service"

const mockRefreshSessionRepository = {
    save: vi.fn(),
    findOne: vi.fn(),
    delete: vi.fn(),
}

const mockJwtService = {
    signAsync: vi.fn(),
    sign: vi.fn(),
    verify: vi.fn(),
}

const mockConfigService = {
    getOrThrow: vi.fn((key: string) => `${key}-value`),
}

const mockCryptoService = {
    hashData: vi.fn(),
}

describe("TokensService", () => {
    let service: TokensService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokensService,
                { provide: getRepositoryToken(RefreshSessionEntity), useValue: mockRefreshSessionRepository },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: CryptoService, useValue: mockCryptoService },
            ],
        }).compile()

        service = module.get(TokensService)
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.useRealTimers()
    })

    // -------------------------------------------------------------------------

    describe("createRefreshSession", () => {
        const user = { id: 1, role: UserRole.USER } as UserEntity

        beforeEach(() => {
            mockJwtService.signAsync
                .mockResolvedValueOnce("access-token")
                .mockResolvedValueOnce("refresh-token")
            mockCryptoService.hashData.mockResolvedValue("hashed-refresh-token")
        })

        it("should return access and refresh tokens", async () => {
            const result = await service.createRefreshSession(user, "agent", "127.0.0.1", "fp")

            expect(result).toEqual({ accessToken: "access-token", refreshToken: "refresh-token" })
        })

        it("should save session with hashed refresh token", async () => {
            await service.createRefreshSession(user, "agent", "127.0.0.1", "fp")

            expect(mockCryptoService.hashData).toHaveBeenCalledWith("refresh-token")
            expect(mockRefreshSessionRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    user,
                    refreshToken: "hashed-refresh-token", // в базу попадает хеш, а не сам токен
                    userAgent: "agent",
                    ip: "127.0.0.1",
                    fingerprint: "fp",
                })
            )
        })

        it("should set session expiration according to refresh token TTL", async () => {
            vi.useFakeTimers({ toFake: ["Date"] })
            vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))

            await service.createRefreshSession(user, "agent", "127.0.0.1", "fp")

            const savedSession = mockRefreshSessionRepository.save.mock.calls[0][0]
            expect(savedSession.expiresAt).toEqual(new Date(Date.now() + REFRESH_TOKEN_TTL))
        })
    })

    // -------------------------------------------------------------------------

    describe("findRefreshSession", () => {
        it("should find session by user id and fingerprint", async () => {
            const fakeSession = { id: 1 } as RefreshSessionEntity
            mockRefreshSessionRepository.findOne.mockResolvedValue(fakeSession)

            const result = await service.findRefreshSession(1, "fp")

            expect(result).toEqual(fakeSession)
            expect(mockRefreshSessionRepository.findOne).toHaveBeenCalledWith({
                where: { user: { id: 1 }, fingerprint: "fp" },
            })
        })

        it("should return null when session does not exist", async () => {
            mockRefreshSessionRepository.findOne.mockResolvedValue(null)

            const result = await service.findRefreshSession(1, "fp")

            expect(result).toBeNull()
        })
    })

    // -------------------------------------------------------------------------

    describe("deleteRefreshSession", () => {
        it("should delete session by user id and fingerprint", async () => {
            mockRefreshSessionRepository.delete.mockResolvedValue({ affected: 1 })

            await service.deleteRefreshSession(1, "fp")

            expect(mockRefreshSessionRepository.delete).toHaveBeenCalledWith({
                user: { id: 1 },
                fingerprint: "fp",
            })
        })

        it("should throw NotFoundException when session does not exist", async () => {
            mockRefreshSessionRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.deleteRefreshSession(1, "fp")).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("signResetToken", () => {
        it("should sign token with user id", () => {
            mockJwtService.sign.mockReturnValue("reset-token")

            const result = service.signResetToken(7)

            expect(result).toBe("reset-token")
            expect(mockJwtService.sign).toHaveBeenCalledWith(
                { sub: 7 },
                expect.objectContaining({ secret: "JWT_ACCESS_SECRET-value" })
            )
        })

        it("should sign token that lives 15 minutes", () => {
            service.signResetToken(7)

            // jwt принимает число в СЕКУНДАХ, поэтому 15 минут = 900
            const options = mockJwtService.sign.mock.calls[0][1]
            expect(options.expiresIn).toBe(15 * 60)
        })
    })

    // -------------------------------------------------------------------------

    describe("verifyResetToken", () => {
        it("should return user id from valid token", () => {
            mockJwtService.verify.mockReturnValue({ sub: 7 })

            const result = service.verifyResetToken("token")

            expect(result).toBe(7)
        })

        it("should return null when token is invalid or expired", () => {
            mockJwtService.verify.mockImplementation(() => {
                throw new Error("jwt expired")
            })

            const result = service.verifyResetToken("bad-token")

            expect(result).toBeNull()
        })
    })
})
