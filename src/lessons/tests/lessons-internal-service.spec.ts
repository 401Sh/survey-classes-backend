import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonEntity } from "../entities/lesson.entity"
import { LessonsInternalService } from "../services/lessons-internal.service"

const mockLessonRepository = {
    exists: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
}

describe("LessonsInternalService", () => {
    let service: LessonsInternalService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LessonsInternalService,
                {
                    provide: getRepositoryToken(LessonEntity),
                    useValue: mockLessonRepository,
                },
            ],
        }).compile()

        service = module.get<LessonsInternalService>(LessonsInternalService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe("exists", () => {
        it("should return true when lesson exists", async () => {
            mockLessonRepository.exists.mockResolvedValue(true)

            const result = await service.exists(1)

            expect(result).toBe(true)
        })

        it("should return false when lesson does not exist", async () => {
            mockLessonRepository.exists.mockResolvedValue(false)

            const result = await service.exists(99)

            expect(result).toBe(false)
        })
    })

    describe("findSimplifiedWithSurvey", () => {
        it("should return lesson when it exists and is active", async () => {
            const fakeLesson = {
                id: 1,
                enrollmentMode: "open",
                requiresSurvey: true,
                survey: { id: 5 },
            } as unknown as LessonEntity
            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)

            const result = await service.findSimplifiedWithSurvey(1)

            expect(result).toEqual(fakeLesson)
        })

        it("should return lesson without survey when survey is not set", async () => {
            const fakeLesson = {
                id: 1,
                enrollmentMode: "open",
                requiresSurvey: false,
                survey: null,
            } as unknown as LessonEntity
            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)

            const result = await service.findSimplifiedWithSurvey(1)

            expect(result.survey).toBeNull()
        })

        it("should throw NotFoundException when lesson does not exist or is inactive", async () => {
            mockLessonRepository.findOne.mockResolvedValue(null)

            await expect(service.findSimplifiedWithSurvey(99)).rejects.toThrow(NotFoundException)
        })
    })

    describe("updateSurveyRequirement", () => {
        it("should update requiresSurvey successfully", async () => {
            mockLessonRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.updateSurveyRequirement(1, true)).resolves.not.toThrow()
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.update.mockResolvedValue({ affected: 0 })

            await expect(service.updateSurveyRequirement(99, true)).rejects.toThrow(NotFoundException)
        })
    })
})