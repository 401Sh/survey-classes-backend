import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { NotFoundException } from "@nestjs/common"
import { SurveysService } from "../services/surveys.service"
import { SurveyEntity } from "../entities/survey.entity"

const mockSurveyRepository = {
    findOne: vi.fn(),
}

describe("SurveysService", () => {
    let service: SurveysService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SurveysService,
                {
                    provide: getRepositoryToken(SurveyEntity),
                    useValue: mockSurveyRepository,
                },
            ],
        }).compile()

        service = module.get<SurveysService>(SurveysService)
    })

    afterEach(() => {
        vi.clearAllMocks() // clear mocks after each test
    })

    describe("findById", () => {
        it("should return survey when it exists", async () => {
            const fakeSurvey = {
                id: 1,
                title: "Test Survey",
                description: "Test",
                questions: [],
            } as unknown as SurveyEntity
    
            mockSurveyRepository.findOne.mockResolvedValue(fakeSurvey)
    
            const result = await service.findById(1)
    
            expect(result).toEqual(fakeSurvey)
        })
    
        it("should throw NotFoundException when survey does not exist", async () => {
            mockSurveyRepository.findOne.mockResolvedValue(null)
    
            await expect(service.findById(999)).rejects.toThrow(NotFoundException)
        })
    })
})