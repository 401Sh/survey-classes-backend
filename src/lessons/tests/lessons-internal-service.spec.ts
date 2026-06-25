import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonEntity } from "../entities/lesson.entity"
import { LessonsInternalService } from "../services/lessons-internal.service"
import { EnrollmentMode } from "../enums/enrollment-mode.enum"

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

    describe("findSimplified", () => {
        it("should return lesson when it exists and is active", async () => {
            const fakeLesson = {
                id: 1,
                enrollmentMode: EnrollmentMode.AUTO,
            } as unknown as LessonEntity
            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)

            const result = await service.findSimplified(1)

            expect(result).toEqual(fakeLesson)
        })

        it("should throw NotFoundException when lesson does not exist or is inactive", async () => {
            mockLessonRepository.findOne.mockResolvedValue(null)

            await expect(service.findSimplified(99)).rejects.toThrow(NotFoundException)
        })
    })
})