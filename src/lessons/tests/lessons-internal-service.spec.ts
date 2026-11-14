import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonEntity } from "../entities/lesson.entity"
import { LessonRepository } from "../abstracts/lesson-repository.abstract"
import { LessonsInternalService } from "../services/lessons-internal.service"

const mockLessonRepository = {
    existsById: vi.fn(),
    findActiveSimplifiedById: vi.fn(),
}

describe("LessonsInternalService", () => {
    let service: LessonsInternalService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LessonsInternalService,
                { provide: LessonRepository, useValue: mockLessonRepository },
            ],
        }).compile()

        service = module.get(LessonsInternalService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("exists", () => {
        it("should return true when lesson exists", async () => {
            mockLessonRepository.existsById.mockResolvedValue(true)

            const result = await service.exists(1)

            expect(result).toBe(true)
            expect(mockLessonRepository.existsById).toHaveBeenCalledWith(1)
        })

        it("should return false when lesson does not exist", async () => {
            mockLessonRepository.existsById.mockResolvedValue(false)

            const result = await service.exists(99)

            expect(result).toBe(false)
        })
    })

    // -------------------------------------------------------------------------

    describe("findSimplified", () => {
        it("should return lesson when it exists and is active", async () => {
            const fakeLesson = { id: 1 } as LessonEntity
            mockLessonRepository.findActiveSimplifiedById.mockResolvedValue(fakeLesson)

            const result = await service.findSimplified(1)

            expect(result).toEqual(fakeLesson)
            expect(mockLessonRepository.findActiveSimplifiedById).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when lesson is not found", async () => {
            mockLessonRepository.findActiveSimplifiedById.mockResolvedValue(null)

            await expect(service.findSimplified(99)).rejects.toThrow(NotFoundException)
        })
    })
})