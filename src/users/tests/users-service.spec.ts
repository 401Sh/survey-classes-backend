import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { UserEntity } from "../entities/user.entity"
import { UserRepository } from "../abstracts/user-repository.abstract"
import { UsersService } from "../services/users.service"

const mockUserRepository = {
    update: vi.fn(),
    findSimplifiedById: vi.fn(),
}

describe("UsersService", () => {
    let service: UsersService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: UserRepository, useValue: mockUserRepository },
            ],
        }).compile()

        service = module.get(UsersService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("updateName", () => {
        it("should update user name", async () => {
            mockUserRepository.update.mockResolvedValue(true)

            await service.updateName(1, { firstName: "Ivan", secondName: "Ivanov" })

            expect(mockUserRepository.update).toHaveBeenCalledWith(1, { firstName: "Ivan", secondName: "Ivanov" })
        })

        it("should throw NotFoundException when user does not exist", async () => {
            mockUserRepository.update.mockResolvedValue(false)

            await expect(service.updateName(99, { firstName: "Ivan" })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return user when it exists", async () => {
            const fakeUser = { id: 1, email: "a@b.c" } as UserEntity
            mockUserRepository.findSimplifiedById.mockResolvedValue(fakeUser)

            const result = await service.findById(1)

            expect(result).toEqual(fakeUser)
            expect(mockUserRepository.findSimplifiedById).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when user does not exist", async () => {
            mockUserRepository.findSimplifiedById.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })
})