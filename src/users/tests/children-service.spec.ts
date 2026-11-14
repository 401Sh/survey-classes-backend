import { NotFoundException, ConflictException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { UserChildEntity } from "../entities/user-child.entity"
import { ChildRepository } from "../abstracts/child-repository.abstract"
import { CreateChildBodyDto } from "../dto"
import { ChildrenService } from "../services/children.service"

const mockChildRepository = {
    create: vi.fn(),
    findByIdAndUserId: vi.fn(),
    findAllByUserId: vi.fn(),
    existsNotSuspendedEnrollments: vi.fn(),
    existsByIdAndUserId: vi.fn(),
    updateByIdAndUserId: vi.fn(),
    delete: vi.fn(),
}

describe("ChildrenService", () => {
    let service: ChildrenService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChildrenService,
                { provide: ChildRepository, useValue: mockChildRepository },
            ],
        }).compile()

        service = module.get(ChildrenService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("create", () => {
        it("should create child for user", async () => {
            const data = { firstName: "Ivan", birthDate: new Date("2018-05-01") } as CreateChildBodyDto
            const fakeChild = { id: 1 } as UserChildEntity
            mockChildRepository.create.mockResolvedValue(fakeChild)

            const result = await service.create(5, data)

            expect(result).toEqual(fakeChild)
            expect(mockChildRepository.create).toHaveBeenCalledWith(5, data)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        it("should return children of the user", async () => {
            const fakeChildren = [{ id: 1 }, { id: 2 }] as UserChildEntity[]
            mockChildRepository.findAllByUserId.mockResolvedValue(fakeChildren)

            const result = await service.findAll(5)

            expect(result).toEqual(fakeChildren)
            expect(mockChildRepository.findAllByUserId).toHaveBeenCalledWith(5)
        })

        it("should return empty array when user has no children", async () => {
            mockChildRepository.findAllByUserId.mockResolvedValue([])

            const result = await service.findAll(5)

            expect(result).toEqual([])
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return child when it belongs to user", async () => {
            const fakeChild = { id: 1 } as UserChildEntity
            mockChildRepository.findByIdAndUserId.mockResolvedValue(fakeChild)

            const result = await service.findById(5, 1)

            expect(result).toEqual(fakeChild)
            // порядок аргументов в репозитории: сначала id ребёнка, потом id пользователя
            expect(mockChildRepository.findByIdAndUserId).toHaveBeenCalledWith(1, 5)
        })

        it("should throw NotFoundException when child is not found", async () => {
            mockChildRepository.findByIdAndUserId.mockResolvedValue(null)

            await expect(service.findById(5, 99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should update child", async () => {
            mockChildRepository.updateByIdAndUserId.mockResolvedValue(true)

            await service.update(5, 1, { firstName: "Petr" })

            expect(mockChildRepository.updateByIdAndUserId).toHaveBeenCalledWith(1, 5, { firstName: "Petr" })
        })

        it("should throw NotFoundException when child is not found", async () => {
            mockChildRepository.updateByIdAndUserId.mockResolvedValue(false)

            await expect(service.update(5, 99, { firstName: "Petr" })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete child without active enrollments", async () => {
            mockChildRepository.existsByIdAndUserId.mockResolvedValue(true)
            mockChildRepository.existsNotSuspendedEnrollments.mockResolvedValue(false)
            mockChildRepository.delete.mockResolvedValue(true)

            await service.delete(5, 1)

            expect(mockChildRepository.delete).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when child does not belong to user", async () => {
            mockChildRepository.existsByIdAndUserId.mockResolvedValue(false)

            await expect(service.delete(5, 99)).rejects.toThrow(NotFoundException)
            expect(mockChildRepository.delete).not.toHaveBeenCalled()
        })

        it("should throw ConflictException when child has active enrollments", async () => {
            mockChildRepository.existsByIdAndUserId.mockResolvedValue(true)
            mockChildRepository.existsNotSuspendedEnrollments.mockResolvedValue(true)

            await expect(service.delete(5, 1)).rejects.toThrow(ConflictException)
            expect(mockChildRepository.delete).not.toHaveBeenCalled()
        })

        it("should throw NotFoundException when repository did not delete anything", async () => {
            mockChildRepository.existsByIdAndUserId.mockResolvedValue(true)
            mockChildRepository.existsNotSuspendedEnrollments.mockResolvedValue(false)
            mockChildRepository.delete.mockResolvedValue(false)

            await expect(service.delete(5, 1)).rejects.toThrow(NotFoundException)
        })
    })
})