import { NotFoundException, ConflictException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { CategoryEntity } from "../entities/category.entity"
import { DictionaryRepository } from "../abstracts/dictionary-repository.abstract"
import { ManageDictionariesService } from "../services/manage-dictionaries.service"

const mockDictionaryRepository = {
    save: vi.fn(),
    existsByName: vi.fn(),
    findById: vi.fn(),
    findAllById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}

describe("ManageDictionariesService", () => {
    let service: ManageDictionariesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageDictionariesService,
                { provide: DictionaryRepository, useValue: mockDictionaryRepository },
            ],
        }).compile()

        service = module.get(ManageDictionariesService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("createCategory", () => {
        it("should create category when name is free", async () => {
            const fakeCategory = { id: 1, name: "Math" } as CategoryEntity
            mockDictionaryRepository.existsByName.mockResolvedValue(false)
            mockDictionaryRepository.save.mockResolvedValue(fakeCategory)

            const result = await service.createCategory({ name: "Math" })

            expect(result).toEqual(fakeCategory)
            expect(mockDictionaryRepository.existsByName).toHaveBeenCalledWith("Math")
            expect(mockDictionaryRepository.save).toHaveBeenCalledWith({ name: "Math" })
        })

        it("should throw ConflictException when category with this name already exists", async () => {
            mockDictionaryRepository.existsByName.mockResolvedValue(true)

            await expect(service.createCategory({ name: "Math" })).rejects.toThrow(ConflictException)
            expect(mockDictionaryRepository.save).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("findCategoriesByIds", () => {
        it("should return categories by given ids", async () => {
            const fakeCategories = [{ id: 1 }, { id: 2 }] as CategoryEntity[]
            mockDictionaryRepository.findAllById.mockResolvedValue(fakeCategories)

            const result = await service.findCategoriesByIds([1, 2])

            expect(result).toEqual(fakeCategories)
            expect(mockDictionaryRepository.findAllById).toHaveBeenCalledWith([1, 2])
        })
    })

    // -------------------------------------------------------------------------

    describe("updateCategory", () => {
        const fakeCategory = { id: 1, name: "Math" } as CategoryEntity

        it("should update category with new name", async () => {
            mockDictionaryRepository.findById.mockResolvedValue(fakeCategory)
            mockDictionaryRepository.existsByName.mockResolvedValue(false)
            mockDictionaryRepository.update.mockResolvedValue(true)

            await service.updateCategory(1, { name: "Physics" })

            expect(mockDictionaryRepository.existsByName).toHaveBeenCalledWith("Physics")
            expect(mockDictionaryRepository.update).toHaveBeenCalledWith(1, { name: "Physics" })
        })

        it("should not check name uniqueness when name is not changed", async () => {
            mockDictionaryRepository.findById.mockResolvedValue(fakeCategory)
            mockDictionaryRepository.update.mockResolvedValue(true)

            await service.updateCategory(1, { name: "Math" })

            expect(mockDictionaryRepository.existsByName).not.toHaveBeenCalled()
            expect(mockDictionaryRepository.update).toHaveBeenCalled()
        })

        it("should throw NotFoundException when category does not exist", async () => {
            mockDictionaryRepository.findById.mockResolvedValue(null)

            await expect(service.updateCategory(99, { name: "Physics" })).rejects.toThrow(NotFoundException)
            expect(mockDictionaryRepository.update).not.toHaveBeenCalled()
        })

        it("should throw ConflictException when new name is already used", async () => {
            mockDictionaryRepository.findById.mockResolvedValue(fakeCategory)
            mockDictionaryRepository.existsByName.mockResolvedValue(true)

            await expect(service.updateCategory(1, { name: "Physics" })).rejects.toThrow(ConflictException)
            expect(mockDictionaryRepository.update).not.toHaveBeenCalled()
        })

        it("should throw NotFoundException when repository did not update anything", async () => {
            mockDictionaryRepository.findById.mockResolvedValue(fakeCategory)
            mockDictionaryRepository.existsByName.mockResolvedValue(false)
            mockDictionaryRepository.update.mockResolvedValue(false)

            await expect(service.updateCategory(1, { name: "Physics" })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("deleteCategory", () => {
        it("should delete category", async () => {
            mockDictionaryRepository.delete.mockResolvedValue(true)

            await service.deleteCategory(1)

            expect(mockDictionaryRepository.delete).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when category does not exist", async () => {
            mockDictionaryRepository.delete.mockResolvedValue(false)

            await expect(service.deleteCategory(99)).rejects.toThrow(NotFoundException)
        })
    })
})