import { NotFoundException, BadRequestException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { EnrollmentMode } from "src/lessons/enums/enrollment-mode.enum"
import { LessonPricingTiersInternalService } from "src/lessons/services/lesson-pricing-tiers-internal.service"
import { LessonsInternalService } from "src/lessons/services/lessons-internal.service"
import { SubscriptionsInternalService } from "src/subscriptions/services/subscriptions-internal.service"
import { ChildrenInternalService } from "src/users/services/children-internal.service"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { EnrollmentsService } from "../services/enrollments.service"
import { SortDirection } from "src/common/enums/sort-direction.enum"

const createQueryBuilderMock = () => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
})

const mockEnrollmentRepository = {
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    exists: vi.fn(),
    delete: vi.fn(),
    createQueryBuilder: vi.fn(),
}

const mockChildrenService = {
    existsAndOwnedBy: vi.fn(),
}

const mockLessonsService = {
    findSimplifiedWithSurvey: vi.fn(),
}

const mockPricingTiersService = {
    findActiveAndLinked: vi.fn(),
}

const mockSubscriptionsService = {
    bareCreate: vi.fn(),
    findAllByEnrollmentIdAndUserId: vi.fn(),
}

describe("EnrollmentsService", () => {
    let service: EnrollmentsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EnrollmentsService,
                {
                    provide: getRepositoryToken(EnrollmentEntity),
                    useValue: mockEnrollmentRepository,
                },
                {
                    provide: ChildrenInternalService,
                    useValue: mockChildrenService,
                },
                {
                    provide: LessonsInternalService,
                    useValue: mockLessonsService,
                },
                {
                    provide: LessonPricingTiersInternalService,
                    useValue: mockPricingTiersService,
                },
                {
                    provide: SubscriptionsInternalService,
                    useValue: mockSubscriptionsService,
                },
            ],
        }).compile()

        service = module.get<EnrollmentsService>(EnrollmentsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("create", () => {
        const baseDto = {
            lessonId: 1,
            childId: 1,
            consentedAt: new Date(),
            isConsented: true,
        }

        it("should create enrollment with ACTIVE status when lesson is AUTO mode without survey", async () => {
            const fakeLesson = {
                id: 1,
                enrollmentMode: EnrollmentMode.AUTO,
                requiresSurvey: false,
                survey: null,
            }
            const fakeEnrollment = { id: 1, status: EnrollmentStatus.ACTIVE } as unknown as EnrollmentEntity

            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplifiedWithSurvey.mockResolvedValue(fakeLesson)
            mockEnrollmentRepository.exists.mockResolvedValue(false)
            mockEnrollmentRepository.save.mockResolvedValue(fakeEnrollment)

            const result = await service.create(1, baseDto)

            expect(result.enrollment).toEqual(fakeEnrollment)
            expect(mockEnrollmentRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ status: EnrollmentStatus.ACTIVE })
            )
        })

        it("should create enrollment with PENDING status when lesson requires survey", async () => {
            const fakeLesson = {
                id: 1,
                enrollmentMode: EnrollmentMode.AUTO,
                requiresSurvey: true,
                survey: { id: 5 },
            }
            const fakeEnrollment = { id: 1, status: EnrollmentStatus.PENDING } as unknown as EnrollmentEntity

            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplifiedWithSurvey.mockResolvedValue(fakeLesson)
            mockEnrollmentRepository.exists.mockResolvedValue(false)
            mockEnrollmentRepository.save.mockResolvedValue(fakeEnrollment)

            const result = await service.create(1, baseDto)

            expect(mockEnrollmentRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ status: EnrollmentStatus.PENDING })
            )
            expect(result.requiresSurvey).toBe(true)
            expect(result.surveyId).toBe(5)
        })

        it("should create enrollment with PENDING status when lesson is MANUAL mode", async () => {
            const fakeLesson = {
                id: 1,
                enrollmentMode: EnrollmentMode.MANUAL,
                requiresSurvey: false,
                survey: null,
            }
            const fakeEnrollment = { id: 1 } as unknown as EnrollmentEntity

            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplifiedWithSurvey.mockResolvedValue(fakeLesson)
            mockEnrollmentRepository.exists.mockResolvedValue(false)
            mockEnrollmentRepository.save.mockResolvedValue(fakeEnrollment)

            await service.create(1, baseDto)

            expect(mockEnrollmentRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ status: EnrollmentStatus.PENDING })
            )
        })

        it("should return requiresSurvey false and surveyId null when lesson has no survey", async () => {
            const fakeLesson = {
                id: 1,
                enrollmentMode: EnrollmentMode.AUTO,
                requiresSurvey: false,
                survey: null,
            }
            const fakeEnrollment = { id: 1 } as unknown as EnrollmentEntity

            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplifiedWithSurvey.mockResolvedValue(fakeLesson)
            mockEnrollmentRepository.exists.mockResolvedValue(false)
            mockEnrollmentRepository.save.mockResolvedValue(fakeEnrollment)

            const result = await service.create(1, baseDto)

            expect(result.requiresSurvey).toBe(false)
            expect(result.surveyId).toBeNull()
        })

        it("should throw NotFoundException when child does not belong to user", async () => {
            mockChildrenService.existsAndOwnedBy.mockResolvedValue(false)

            await expect(service.create(1, baseDto)).rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplifiedWithSurvey.mockRejectedValue(new NotFoundException())

            await expect(service.create(1, baseDto)).rejects.toThrow(NotFoundException)
        })

        it("should throw BadRequestException when child is already enrolled", async () => {
            const fakeLesson = {
                id: 1,
                enrollmentMode: EnrollmentMode.AUTO,
                requiresSurvey: false,
                survey: null,
            }

            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplifiedWithSurvey.mockResolvedValue(fakeLesson)
            mockEnrollmentRepository.exists.mockResolvedValue(true) // уже есть активная запись

            await expect(service.create(1, baseDto)).rejects.toThrow(BadRequestException)
        })
    })

    // -------------------------------------------------------------------------

    describe("createSubscription", () => {
        it("should create subscription for active enrollment", async () => {
            const fakeEnrollment = {
                id: 1,
                status: EnrollmentStatus.ACTIVE,
                lesson: { id: 10 },
            } as unknown as EnrollmentEntity

            const fakePricingTier = { id: 2, price: 1000, sessionsCount: 8 }
            const fakeSubscription = { id: 1 } as unknown as EnrollmentEntity

            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)
            mockPricingTiersService.findActiveAndLinked.mockResolvedValue(fakePricingTier)
            mockSubscriptionsService.bareCreate.mockResolvedValue(fakeSubscription)

            const result = await service.createSubscription(1, 1, { pricingTierId: 2 })

            expect(result).toEqual(fakeSubscription)
            expect(mockSubscriptionsService.bareCreate).toHaveBeenCalledWith(1, 2, 1000, 8)
        })

        it("should throw NotFoundException when enrollment does not exist or not active", async () => {
            mockEnrollmentRepository.findOne.mockResolvedValue(null)

            await expect(service.createSubscription(1, 99, { pricingTierId: 1 }))
                .rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when pricing tier does not exist or not linked to lesson", async () => {
            const fakeEnrollment = {
                id: 1,
                status: EnrollmentStatus.ACTIVE,
                lesson: { id: 10 },
            } as unknown as EnrollmentEntity

            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)
            mockPricingTiersService.findActiveAndLinked.mockRejectedValue(new NotFoundException())

            await expect(service.createSubscription(1, 1, { pricingTierId: 99 }))
                .rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        const baseQuery = {
            page: 1,
            limit: 10,
            sortDirection: SortDirection.DESC,
        }

        it("should return paginated result filtered by userId", async () => {
            const fakeEnrollments = [{ id: 1 }] as unknown as EnrollmentEntity[]
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([fakeEnrollments, 1])
            mockEnrollmentRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll(1, baseQuery)

            expect(result.data).toEqual(fakeEnrollments)
            expect(qb.where).toHaveBeenCalledWith("users.id = :userId", { userId: 1 })
        })

        it("should calculate totalPagesAmount correctly", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 25])
            mockEnrollmentRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll(1, { ...baseQuery, limit: 10 })

            expect(result.meta.totalPagesAmount).toBe(3)
        })

        it("should apply optional filters when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockEnrollmentRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll(1, {
                ...baseQuery,
                childId: 2,
                lessonId: 3,
                status: EnrollmentStatus.ACTIVE,
            })

            expect(qb.andWhere).toHaveBeenCalledWith("children.id = :childId", { childId: 2 })
            expect(qb.andWhere).toHaveBeenCalledWith("lessons.id = :lessonId", { lessonId: 3 })
            expect(qb.andWhere).toHaveBeenCalledWith(
                "enrollments.status = :status",
                { status: EnrollmentStatus.ACTIVE }
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return enrollment when it exists and belongs to user", async () => {
            const fakeEnrollment = { id: 1 } as unknown as EnrollmentEntity
            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)

            const result = await service.findById(1, 1)

            expect(result).toEqual(fakeEnrollment)
        })

        it("should throw NotFoundException when enrollment does not exist or belongs to another user", async () => {
            mockEnrollmentRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(1, 99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAllSubscriptionsByEnrollmentId", () => {
        it("should return subscriptions for enrollment", async () => {
            const fakeSubscriptions = [{ id: 1 }, { id: 2 }]
            mockSubscriptionsService.findAllByEnrollmentIdAndUserId.mockResolvedValue(fakeSubscriptions)

            const result = await service.findAllSubscriptionsByEnrollmentId(1, 1)

            expect(result).toEqual(fakeSubscriptions)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete pending enrollment belonging to user", async () => {
            mockEnrollmentRepository.delete.mockResolvedValue({ affected: 1 })

            await expect(service.delete(1, 1)).resolves.not.toThrow()

            expect(mockEnrollmentRepository.delete).toHaveBeenCalledWith({
                id: 1,
                user: { id: 1 },
                status: EnrollmentStatus.PENDING,
            })
        })

        it("should throw NotFoundException when pending enrollment not found", async () => {
            mockEnrollmentRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.delete(1, 99)).rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when enrollment is not in PENDING status", async () => {
            mockEnrollmentRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.delete(1, 1)).rejects.toThrow(NotFoundException)
        })
    })
})