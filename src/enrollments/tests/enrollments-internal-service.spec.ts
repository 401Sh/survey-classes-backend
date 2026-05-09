import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { EnrollmentsInternalService } from "../services/enrollments-internal.service"

const mockEnrollmentRepository = {
    findOne: vi.fn(),
}

describe("EnrollmentsInternalService", () => {
    let service: EnrollmentsInternalService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EnrollmentsInternalService,
                {
                    provide: getRepositoryToken(EnrollmentEntity),
                    useValue: mockEnrollmentRepository,
                },
            ],
        }).compile()

        service = module.get<EnrollmentsInternalService>(EnrollmentsInternalService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe("findOwnedWithLessonAndSurvey", () => {
        it("should return enrollment when it exists and belongs to user", async () => {
            const fakeEnrollment = {
                id: 1,
                lesson: { id: 10, requiresSurvey: true, survey: { id: 5 } },
            } as unknown as EnrollmentEntity
            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)

            const result = await service.findOwnedWithLessonAndSurvey(1, 1)

            expect(result).toEqual(fakeEnrollment)
        })

        it("should return enrollment when lesson has no survey", async () => {
            const fakeEnrollment = {
                id: 1,
                lesson: { id: 10, requiresSurvey: false, survey: null },
            } as unknown as EnrollmentEntity
            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)

            const result = await service.findOwnedWithLessonAndSurvey(1, 1)

            expect(result.lesson.survey).toBeNull()
        })

        it("should throw NotFoundException when enrollment does not exist", async () => {
            mockEnrollmentRepository.findOne.mockResolvedValue(null)

            await expect(service.findOwnedWithLessonAndSurvey(99, 1))
                .rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when enrollment belongs to another user", async () => {
            mockEnrollmentRepository.findOne.mockResolvedValue(null)

            await expect(service.findOwnedWithLessonAndSurvey(1, 99))
                .rejects.toThrow(NotFoundException)
        })
    })
})