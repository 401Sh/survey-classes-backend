import { ConflictException, UnauthorizedException, NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { UserEntity } from "../entities/user.entity"
import { UsersInternalService } from "../services/users-internal.service"

const mockUserRepository = {
    save: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
}

describe("UsersInternalService", () => {
    let service: UsersInternalService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersInternalService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: mockUserRepository,
                },
            ],
        }).compile()

        service = module.get<UsersInternalService>(UsersInternalService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("create", () => {
        it("should create user with hashed password", async () => {
            const fakeUser = { id: 1, email: "test@test.com" } as unknown as UserEntity

            mockUserRepository.findOne.mockResolvedValue(null)
            mockUserRepository.save.mockResolvedValue(fakeUser)

            const result = await service.create({
                email: "test@test.com",
                password: "plaintext",
                firstName: "John",
                secondName: "Smith"
            })

            expect(result).toEqual(fakeUser)
        })

        it("should save user with hashed password, not plaintext", async () => {
            const fakeUser = { id: 1 } as unknown as UserEntity
            mockUserRepository.findOne.mockResolvedValue(null)
            mockUserRepository.save.mockResolvedValue(fakeUser)

            const plainPassword = "plaintext"
            await service.create({
                email: "test@test.com",
                password: plainPassword,
                firstName: "John",
                secondName: "Smith",
            })

            const savedData = mockUserRepository.save.mock.calls[0][0]

            // password must be hashed and doesnt match with original
            expect(savedData.password).not.toBe(plainPassword)
            expect(savedData.password).toBeTruthy()
        })

        it("should throw ConflictException when email is already taken", async () => {
            const existingUser = { id: 1, email: "test@test.com" } as unknown as UserEntity
            mockUserRepository.findOne.mockResolvedValue(existingUser)

            await expect(
                service.create({ email: "test@test.com", password: "123", firstName: "John", secondName: "Smith" })
            ).rejects.toThrow(ConflictException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findUser", () => {
        it("should return user when it exists", async () => {
            const fakeUser = { id: 1, email: "test@test.com" } as unknown as UserEntity
            mockUserRepository.findOne.mockResolvedValue(fakeUser)

            const result = await service.findUser(1)

            expect(result).toEqual(fakeUser)
        })

        it("should return null when user does not exist", async () => {
            mockUserRepository.findOne.mockResolvedValue(null)

            const result = await service.findUser(99)

            expect(result).toBeNull()
        })
    })

    // -------------------------------------------------------------------------

    describe("findByEmailWithPass", () => {
        it("should return user with password fields", async () => {
            const fakeUser = {
                id: 1,
                email: "test@test.com",
                password: "hashed",
            } as unknown as UserEntity
            mockUserRepository.findOne.mockResolvedValue(fakeUser)

            const result = await service.findByEmailWithPass("test@test.com")

            expect(result).toEqual(fakeUser)
        })

        it("should return null when user not found", async () => {
            mockUserRepository.findOne.mockResolvedValue(null)

            const result = await service.findByEmailWithPass("notexist@test.com")

            expect(result).toBeNull()
        })
    })

    // -------------------------------------------------------------------------

    describe("findByEmailWithVerification", () => {
        it("should return user with emailVerification relation", async () => {
            const fakeUser = {
                id: 1,
                email: "test@test.com",
                emailVerification: { token: "abc" },
            } as unknown as UserEntity
            mockUserRepository.findOne.mockResolvedValue(fakeUser)

            const result = await service.findByEmailWithVerification("test@test.com")

            expect(result).toEqual(fakeUser)
        })

        it("should return null when user not found", async () => {
            mockUserRepository.findOne.mockResolvedValue(null)

            const result = await service.findByEmailWithVerification("notexist@test.com")

            expect(result).toBeNull()
        })
    })

    // -------------------------------------------------------------------------

    describe("findByIdOrUnauthorized", () => {
        it("should return user when it exists", async () => {
            const fakeUser = { id: 1 } as unknown as UserEntity
            mockUserRepository.findOne.mockResolvedValue(fakeUser)

            const result = await service.findByIdOrUnauthorized(1)

            expect(result).toEqual(fakeUser)
        })

        it("should throw UnauthorizedException when user does not exist", async () => {
            mockUserRepository.findOne.mockResolvedValue(null)

            await expect(service.findByIdOrUnauthorized(99)).rejects.toThrow(UnauthorizedException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should update user successfully", async () => {
            mockUserRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.update(1, { firstName: "John" })).resolves.not.toThrow()
        })

        it("should throw NotFoundException when user does not exist", async () => {
            mockUserRepository.update.mockResolvedValue({ affected: 0 })

            await expect(service.update(99, { firstName: "John" })).rejects.toThrow(NotFoundException)
        })
    })
})