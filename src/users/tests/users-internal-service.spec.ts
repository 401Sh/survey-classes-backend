import { ConflictException, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import * as argon2 from "argon2"
import { SignUpDto } from "src/auth/dto"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { UserEntity } from "../entities/user.entity"
import { UserRepository } from "../abstracts/user-repository.abstract"
import { UsersInternalService } from "../services/users-internal.service"

const mockUserRepository = {
    create: vi.fn(),
    findByEmail: vi.fn(),
    findByEmailWithVerification: vi.fn(),
    findSimplifiedById: vi.fn(),
    existsByEmail: vi.fn(),
    update: vi.fn(),
}

describe("UsersInternalService", () => {
    let service: UsersInternalService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersInternalService,
                { provide: UserRepository, useValue: mockUserRepository },
            ],
        }).compile()

        service = module.get(UsersInternalService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("create", () => {
        // метод меняет password внутри переданного объекта, поэтому создаём новый на каждый тест
        const createSignUpData = () => ({
            email: "user@mail.com",
            password: "plain-password",
            firstName: "Ivan",
            secondName: "Ivanov",
        }) as SignUpDto

        it("should create user when email is not used", async () => {
            const fakeUser = { id: 1 } as UserEntity
            mockUserRepository.existsByEmail.mockResolvedValue(false)
            mockUserRepository.create.mockResolvedValue(fakeUser)

            const result = await service.create(createSignUpData())

            expect(result).toEqual(fakeUser)
            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith("user@mail.com")
        })

        it("should save hashed password instead of plain one", async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(false)
            mockUserRepository.create.mockResolvedValue({ id: 1 })

            await service.create(createSignUpData())

            const savedData = mockUserRepository.create.mock.calls[0][0]
            expect(savedData.password).not.toBe("plain-password")
            expect(await argon2.verify(savedData.password, "plain-password")).toBe(true)
        })

        it("should throw ConflictException when email is already used", async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(true)

            await expect(service.create(createSignUpData())).rejects.toThrow(ConflictException)
            expect(mockUserRepository.create).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("findByEmailWithPass", () => {
        it("should return user when it exists", async () => {
            const fakeUser = { id: 1 } as UserEntity
            mockUserRepository.findByEmail.mockResolvedValue(fakeUser)

            const result = await service.findByEmailWithPass("user@mail.com")

            expect(result).toEqual(fakeUser)
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("user@mail.com")
        })

        it("should return null when user does not exist", async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null)

            const result = await service.findByEmailWithPass("none@mail.com")

            expect(result).toBeNull()
        })
    })

    // -------------------------------------------------------------------------

    describe("findByEmailWithVerification", () => {
        it("should return user with verification data", async () => {
            const fakeUser = { id: 1 } as UserEntity
            mockUserRepository.findByEmailWithVerification.mockResolvedValue(fakeUser)

            const result = await service.findByEmailWithVerification("user@mail.com")

            expect(result).toEqual(fakeUser)
            expect(mockUserRepository.findByEmailWithVerification).toHaveBeenCalledWith("user@mail.com")
        })
    })

    // -------------------------------------------------------------------------

    describe("findByIdOrUnauthorized", () => {
        it("should return user when it exists", async () => {
            const fakeUser = { id: 1 } as UserEntity
            mockUserRepository.findSimplifiedById.mockResolvedValue(fakeUser)

            const result = await service.findByIdOrUnauthorized(1)

            expect(result).toEqual(fakeUser)
        })

        it("should throw UnauthorizedException when user does not exist", async () => {
            mockUserRepository.findSimplifiedById.mockResolvedValue(null)

            await expect(service.findByIdOrUnauthorized(99)).rejects.toThrow(UnauthorizedException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should update user", async () => {
            mockUserRepository.update.mockResolvedValue(true)

            await service.update(1, { firstName: "Petr" })

            expect(mockUserRepository.update).toHaveBeenCalledWith(1, { firstName: "Petr" })
        })

        it("should throw NotFoundException when user does not exist", async () => {
            mockUserRepository.update.mockResolvedValue(false)

            await expect(service.update(99, { firstName: "Petr" })).rejects.toThrow(NotFoundException)
        })
    })
})