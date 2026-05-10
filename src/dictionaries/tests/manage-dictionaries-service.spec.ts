import { ConflictException, NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { CategoryEntity } from "../entities/category.entity"
import { ManageDictionariesService } from "../services/manage-dictionaries.service"

const mockCategoryRepository = {
    findOne: vi.fn(),
    find: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}

describe("ManageDictionariesService", () => {
    let service: ManageDictionariesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageDictionariesService,
                {
                    provide: getRepositoryToken(CategoryEntity),
                    useValue: mockCategoryRepository,
                },
            ],
        }).compile()

        service = module.get<ManageDictionariesService>(ManageDictionariesService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("createCategory", () => {
        it("should create category when name is unique", async () => {
            const fakeCategory = { id: 1, name: "Math" } as unknown as CategoryEntity
            mockCategoryRepository.findOne.mockResolvedValue(null)
            mockCategoryRepository.save.mockResolvedValue(fakeCategory)

            const result = await service.createCategory({ name: "Math" })

            expect(result).toEqual(fakeCategory)
        })

        it("should throw ConflictException when category with same name already exists", async () => {
            const existing = { id: 1, name: "Math" } as unknown as CategoryEntity
            mockCategoryRepository.findOne.mockResolvedValue(existing)

            await expect(service.createCategory({ name: "Math" }))
                .rejects.toThrow(ConflictException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findCategoriesByIds", () => {
        it("should return categories matching provided ids", async () => {
            const fakeCategories = [{ id: 1 }, { id: 2 }] as unknown as CategoryEntity[]
            mockCategoryRepository.find.mockResolvedValue(fakeCategories)

            const result = await service.findCategoriesByIds([1, 2])

            expect(result).toEqual(fakeCategories)
        })

        it("should return empty array when no categories match", async () => {
            mockCategoryRepository.find.mockResolvedValue([])

            const result = await service.findCategoriesByIds([99, 100])

            expect(result).toEqual([])
        })
    })

    // -------------------------------------------------------------------------

    describe("updateCategory", () => {
        it("should update category successfully", async () => {
            const fakeCategory = { id: 1, name: "Math" } as unknown as CategoryEntity
            mockCategoryRepository.findOne.mockResolvedValueOnce(fakeCategory)
            mockCategoryRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.updateCategory(1, { name: "Math" })).resolves.not.toThrow()
        })

        it("should check for duplicate name when name changes", async () => {
            const fakeCategory = { id: 1, name: "Math" } as unknown as CategoryEntity
            mockCategoryRepository.findOne
                .mockResolvedValueOnce(fakeCategory)
                .mockResolvedValueOnce(null)
            mockCategoryRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.updateCategory(1, { name: "Science" })).resolves.not.toThrow()

            expect(mockCategoryRepository.findOne).toHaveBeenCalledTimes(2)
        })

        it("should not check for duplicate when name does not change", async () => {
            const fakeCategory = { id: 1, name: "Math" } as unknown as CategoryEntity
            mockCategoryRepository.findOne.mockResolvedValueOnce(fakeCategory)
            mockCategoryRepository.update.mockResolvedValue({ affected: 1 })

            await service.updateCategory(1, { name: "Math" })

            expect(mockCategoryRepository.findOne).toHaveBeenCalledTimes(1)
        })

        it("should throw ConflictException when new name is already taken", async () => {
            const fakeCategory = { id: 1, name: "Math" } as unknown as CategoryEntity
            const duplicate = { id: 2, name: "Science" } as unknown as CategoryEntity

            mockCategoryRepository.findOne
                .mockResolvedValueOnce(fakeCategory)
                .mockResolvedValueOnce(duplicate)

            await expect(service.updateCategory(1, { name: "Science" }))
                .rejects.toThrow(ConflictException)
        })

        it("should throw NotFoundException when category does not exist", async () => {
            mockCategoryRepository.findOne.mockResolvedValue(null)

            await expect(service.updateCategory(99, { name: "Math" }))
                .rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("deleteCategory", () => {
        it("should delete category successfully", async () => {
            mockCategoryRepository.delete.mockResolvedValue({ affected: 1 })

            await expect(service.deleteCategory(1)).resolves.not.toThrow()
        })

        it("should throw NotFoundException when category does not exist", async () => {
            mockCategoryRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.deleteCategory(99)).rejects.toThrow(NotFoundException)
        })
    })
})