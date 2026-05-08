import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { UserChildEntity } from "../entities/user-child.entity"
import { ChildrenService } from "../services/children.service"

const mockChildRepository = {
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}

describe("ChildrenService", () => {
    let service: ChildrenService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChildrenService,
                {
                    provide: getRepositoryToken(UserChildEntity),
                    useValue: mockChildRepository,
                },
            ],
        }).compile()

        service = module.get<ChildrenService>(ChildrenService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("create", () => {
        it("should create and return child", async () => {
            const fakeChild = { id: 1, firstName: "Anna" } as unknown as UserChildEntity
            mockChildRepository.save.mockResolvedValue(fakeChild)

            const result = await service.create(1, { firstName: "Anna", birthDate: new Date("2020-01-01") })

            expect(result).toEqual(fakeChild)
        })

        it("should save child with correct userId", async () => {
            const fakeChild = { id: 1 } as unknown as UserChildEntity
            mockChildRepository.save.mockResolvedValue(fakeChild)

            await service.create(42, { firstName: "Anna", birthDate: new Date("2020-01-01") })

            expect(mockChildRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ user: { id: 42 } })
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        it("should return children for user", async () => {
            const fakeChildren = [{ id: 1 }, { id: 2 }] as unknown as UserChildEntity[]
            mockChildRepository.find.mockResolvedValue(fakeChildren)

            const result = await service.findAll(1)

            expect(result).toEqual(fakeChildren)
        })

        it("should return empty array when user has no children", async () => {
            mockChildRepository.find.mockResolvedValue([])

            const result = await service.findAll(1)

            expect(result).toEqual([])
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return child when it exists", async () => {
            const fakeChild = { id: 1, firstName: "Anna" } as unknown as UserChildEntity
            mockChildRepository.findOne.mockResolvedValue(fakeChild)

            const result = await service.findById(1, 1)

            expect(result).toEqual(fakeChild)
        })

        it("should throw NotFoundException when child does not exist", async () => {
            mockChildRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(1, 99)).rejects.toThrow(NotFoundException)
        })

        it("should not return child belonging to another user", async () => {
            mockChildRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(99, 1)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should update child successfully", async () => {
            mockChildRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.update(1, 1, { firstName: "Updated" })).resolves.not.toThrow()
        })

        it("should throw NotFoundException when child does not exist", async () => {
            mockChildRepository.update.mockResolvedValue({ affected: 0 })

            await expect(service.update(1, 99, { firstName: "X" })).rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when child belongs to another user", async () => {
            mockChildRepository.update.mockResolvedValue({ affected: 0 })

            await expect(service.update(99, 1, { firstName: "X" })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete child successfully", async () => {
            mockChildRepository.delete.mockResolvedValue({ affected: 1 })

            await expect(service.delete(1, 1)).resolves.not.toThrow()
        })

        it("should throw NotFoundException when child does not exist", async () => {
            mockChildRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.delete(1, 99)).rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when child belongs to another user", async () => {
            mockChildRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.delete(99, 1)).rejects.toThrow(NotFoundException)
        })
    })
})