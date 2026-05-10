import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { CategoryEntity } from "../entities/category.entity"
import { DictionariesService } from "../services/dictionaries.service"

const mockCategoryRepository = {
    find: vi.fn(),
}

describe("DictionariesService", () => {
    let service: DictionariesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DictionariesService,
                {
                    provide: getRepositoryToken(CategoryEntity),
                    useValue: mockCategoryRepository,
                },
            ],
        }).compile()

        service = module.get<DictionariesService>(DictionariesService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe("findAllCategories", () => {
        it("should return all categories", async () => {
            const fakeCategories = [
                { id: 1, name: "Math" },
                { id: 2, name: "Science" },
            ] as unknown as CategoryEntity[]
            mockCategoryRepository.find.mockResolvedValue(fakeCategories)

            const result = await service.findAllCategories()

            expect(result).toEqual(fakeCategories)
        })

        it("should return empty array when no categories exist", async () => {
            mockCategoryRepository.find.mockResolvedValue([])

            const result = await service.findAllCategories()

            expect(result).toEqual([])
        })
    })
})