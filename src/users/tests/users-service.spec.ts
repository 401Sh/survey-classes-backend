import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { UserEntity } from "../entities/user.entity"
import { UsersInternalService } from "../services/users-internal.service"
import { UsersService } from "../services/users.service"

const mockUserRepository = {
    update: vi.fn(),
}

const mockUsersInternalService = {
    findUser: vi.fn(),
}

describe("UsersService", () => {
    let service: UsersService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: mockUserRepository,
                },
                {
                    provide: UsersInternalService,
                    useValue: mockUsersInternalService,
                },
            ],
        }).compile()

        service = module.get<UsersService>(UsersService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("updateName", () => {
        it("should update user name successfully", async () => {
            mockUserRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.updateName(1, { firstName: "John" })).resolves.not.toThrow()
        })

        it("should throw NotFoundException when user does not exist", async () => {
            mockUserRepository.update.mockResolvedValue({ affected: 0 })

            await expect(service.updateName(99, { firstName: "John" })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return user when it exists", async () => {
            const fakeUser = { id: 1, name: "John" } as unknown as UserEntity
            mockUsersInternalService.findUser.mockResolvedValue(fakeUser)

            const result = await service.findById(1)

            expect(result).toEqual(fakeUser)
        })

        it("should throw NotFoundException when user does not exist", async () => {
            mockUsersInternalService.findUser.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })
})