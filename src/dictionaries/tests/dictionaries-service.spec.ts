import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { CategoryEntity } from "../entities/category.entity"
import { DictionaryRepository } from "../abstracts/dictionary-repository.abstract"
import { DictionariesService } from "../services/dictionaries.service"

const mockDictionaryRepository = {
    findAllSimplified: vi.fn(),
}

describe("DictionariesService", () => {
    let service: DictionariesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DictionariesService,
                { provide: DictionaryRepository, useValue: mockDictionaryRepository },
            ],
        }).compile()

        service = module.get(DictionariesService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findAllCategories", () => {
        it("should return all categories", async () => {
            const fakeCategories = [{ id: 1, name: "Math" }, { id: 2, name: "Art" }] as CategoryEntity[]
            mockDictionaryRepository.findAllSimplified.mockResolvedValue(fakeCategories)

            const result = await service.findAllCategories()

            expect(result).toEqual(fakeCategories)
        })

        it("should return empty array when there are no categories", async () => {
            mockDictionaryRepository.findAllSimplified.mockResolvedValue([])

            const result = await service.findAllCategories()

            expect(result).toEqual([])
        })
    })
})