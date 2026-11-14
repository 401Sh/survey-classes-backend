import { NotFoundException, BadRequestException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { EnrollmentMode } from "src/lessons/enums/enrollment-mode.enum"
import { LessonPricingTiersInternalService } from "src/lessons/services/lesson-pricing-tiers-internal.service"
import { LessonsInternalService } from "src/lessons/services/lessons-internal.service"
import { ChildrenInternalService } from "src/users/services/children-internal.service"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { EnrollmentRepository } from "../abstracts/enrollment-repository.abstract"
import { SubscriptionRepository } from "../abstracts/subscription-repository.abstract"
import { CreateEnrollmentBodyDto, GetEnrollmentListQueryDto } from "../dto"
import { EnrollmentsService } from "../services/enrollments.service"

const mockEnrollmentRepository = {
    create: vi.fn(),
    findByIdAndUserIdWithDetails: vi.fn(),
    findActiveByIdAndUserIdWithLesson: vi.fn(),
    findPageByUserId: vi.fn(),
    existsNotSuspendedByLessonIdAndChildId: vi.fn(),
    deletePendingByIdAndUserId: vi.fn(),
}

const mockSubscriptionRepository = {
    create: vi.fn(),
    findAllByEnrollmentIdAndUserId: vi.fn(),
}

const mockChildrenService = {
    existsAndOwnedBy: vi.fn(),
}

const mockLessonsService = {
    findSimplified: vi.fn(),
}

const mockPricingTiersService = {
    findActiveAndLinked: vi.fn(),
}

describe("EnrollmentsService", () => {
    let service: EnrollmentsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EnrollmentsService,
                { provide: EnrollmentRepository, useValue: mockEnrollmentRepository },
                { provide: SubscriptionRepository, useValue: mockSubscriptionRepository },
                { provide: ChildrenInternalService, useValue: mockChildrenService },
                { provide: LessonsInternalService, useValue: mockLessonsService },
                { provide: LessonPricingTiersInternalService, useValue: mockPricingTiersService },
            ],
        }).compile()

        service = module.get(EnrollmentsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("create", () => {
        const dto = {
            lessonId: 1,
            childId: 2,
            consentedAt: new Date("2026-01-01"),
            isConsented: true,
        } as CreateEnrollmentBodyDto

        it("should create ACTIVE enrollment when lesson has AUTO mode", async () => {
            const fakeEnrollment = { id: 1 } as EnrollmentEntity
            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplified.mockResolvedValue({ id: 1, enrollmentMode: EnrollmentMode.AUTO })
            mockEnrollmentRepository.existsNotSuspendedByLessonIdAndChildId.mockResolvedValue(false)
            mockEnrollmentRepository.create.mockResolvedValue(fakeEnrollment)

            const result = await service.create(5, dto)

            expect(result).toEqual(fakeEnrollment)
            expect(mockEnrollmentRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 5,
                    lessonId: 1,
                    childId: 2,
                    isConsented: true,
                    status: EnrollmentStatus.ACTIVE,
                })
            )
        })

        it("should create PENDING enrollment when lesson has MANUAL mode", async () => {
            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplified.mockResolvedValue({ id: 1, enrollmentMode: EnrollmentMode.MANUAL })
            mockEnrollmentRepository.existsNotSuspendedByLessonIdAndChildId.mockResolvedValue(false)
            mockEnrollmentRepository.create.mockResolvedValue({ id: 1 })

            await service.create(5, dto)

            expect(mockEnrollmentRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ status: EnrollmentStatus.PENDING })
            )
        })

        it("should check that child belongs to the user", async () => {
            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplified.mockResolvedValue({ id: 1, enrollmentMode: EnrollmentMode.AUTO })
            mockEnrollmentRepository.existsNotSuspendedByLessonIdAndChildId.mockResolvedValue(false)
            mockEnrollmentRepository.create.mockResolvedValue({ id: 1 })

            await service.create(5, dto)

            expect(mockChildrenService.existsAndOwnedBy).toHaveBeenCalledWith(2, 5)
        })

        it("should throw NotFoundException when child does not belong to the user", async () => {
            mockChildrenService.existsAndOwnedBy.mockResolvedValue(false)

            await expect(service.create(5, dto)).rejects.toThrow(NotFoundException)
            expect(mockEnrollmentRepository.create).not.toHaveBeenCalled()
        })

        it("should throw BadRequestException when child is already enrolled in the lesson", async () => {
            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplified.mockResolvedValue({ id: 1, enrollmentMode: EnrollmentMode.AUTO })
            mockEnrollmentRepository.existsNotSuspendedByLessonIdAndChildId.mockResolvedValue(true)

            await expect(service.create(5, dto)).rejects.toThrow(BadRequestException)
            expect(mockEnrollmentRepository.create).not.toHaveBeenCalled()
        })

        it("should pass NotFoundException from lessons service when lesson is not found", async () => {
            mockChildrenService.existsAndOwnedBy.mockResolvedValue(true)
            mockLessonsService.findSimplified.mockRejectedValue(new NotFoundException())

            await expect(service.create(5, dto)).rejects.toThrow(NotFoundException)
            expect(mockEnrollmentRepository.create).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("createSubscription", () => {
        const dto = { pricingTierId: 7 }

        it("should create subscription with price and sessions from pricing tier", async () => {
            const fakeSubscription = { id: 1 } as SubscriptionEntity
            mockEnrollmentRepository.findActiveByIdAndUserIdWithLesson.mockResolvedValue({
                id: 3,
                status: EnrollmentStatus.ACTIVE,
                lesson: { id: 10 },
            })
            mockPricingTiersService.findActiveAndLinked.mockResolvedValue({ price: 1000, sessionsCount: 8 })
            mockSubscriptionRepository.create.mockResolvedValue(fakeSubscription)

            const result = await service.createSubscription(5, 3, dto)

            expect(result).toEqual(fakeSubscription)
            expect(mockEnrollmentRepository.findActiveByIdAndUserIdWithLesson).toHaveBeenCalledWith(3, 5)
            expect(mockPricingTiersService.findActiveAndLinked).toHaveBeenCalledWith(7, 10)
            expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(3, 7, {
                priceSnapshot: 1000,
                sessionsTotal: 8,
                sessionsLeft: 8, // в начале все занятия ещё не использованы
            })
        })

        it("should throw NotFoundException when enrollment is not found", async () => {
            mockEnrollmentRepository.findActiveByIdAndUserIdWithLesson.mockResolvedValue(null)

            await expect(service.createSubscription(5, 99, dto)).rejects.toThrow(NotFoundException)
            expect(mockSubscriptionRepository.create).not.toHaveBeenCalled()
        })

        it("should throw BadRequestException when enrollment is not active", async () => {
            mockEnrollmentRepository.findActiveByIdAndUserIdWithLesson.mockResolvedValue({
                id: 3,
                status: EnrollmentStatus.PENDING,
                lesson: { id: 10 },
            })

            await expect(service.createSubscription(5, 3, dto)).rejects.toThrow(BadRequestException)
            expect(mockSubscriptionRepository.create).not.toHaveBeenCalled()
        })

        it("should not create subscription when pricing tier is not found", async () => {
            mockEnrollmentRepository.findActiveByIdAndUserIdWithLesson.mockResolvedValue({
                id: 3,
                status: EnrollmentStatus.ACTIVE,
                lesson: { id: 10 },
            })
            mockPricingTiersService.findActiveAndLinked.mockRejectedValue(new NotFoundException())

            await expect(service.createSubscription(5, 3, dto)).rejects.toThrow(NotFoundException)
            expect(mockSubscriptionRepository.create).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        const query = { page: 1, limit: 10, sortDirection: SortDirection.ASC } as GetEnrollmentListQueryDto

        it("should return enrollments with pagination meta", async () => {
            const fakeEnrollments = [{ id: 1 }, { id: 2 }] as EnrollmentEntity[]
            mockEnrollmentRepository.findPageByUserId.mockResolvedValue([fakeEnrollments, 21])

            const result = await service.findAll(5, query)

            expect(mockEnrollmentRepository.findPageByUserId).toHaveBeenCalledWith(5, query)
            expect(result).toEqual({
                data: fakeEnrollments,
                meta: {
                    totalCount: 21,
                    totalPagesAmount: 3, // 21 запись по 10 на странице = 3 страницы
                    currentPage: 1,
                },
            })
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return enrollment of the user", async () => {
            const fakeEnrollment = { id: 1 } as EnrollmentEntity
            mockEnrollmentRepository.findByIdAndUserIdWithDetails.mockResolvedValue(fakeEnrollment)

            const result = await service.findById(5, 1)

            expect(result).toEqual(fakeEnrollment)
            // порядок аргументов в репозитории: сначала id записи, потом id пользователя
            expect(mockEnrollmentRepository.findByIdAndUserIdWithDetails).toHaveBeenCalledWith(1, 5)
        })

        it("should throw NotFoundException when enrollment is not found", async () => {
            mockEnrollmentRepository.findByIdAndUserIdWithDetails.mockResolvedValue(null)

            await expect(service.findById(5, 99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAllSubscriptionsByEnrollmentId", () => {
        it("should return subscriptions of the user's enrollment", async () => {
            const fakeSubscriptions = [{ id: 1 }, { id: 2 }] as SubscriptionEntity[]
            mockSubscriptionRepository.findAllByEnrollmentIdAndUserId.mockResolvedValue(fakeSubscriptions)

            const result = await service.findAllSubscriptionsByEnrollmentId(5, 3)

            expect(result).toEqual(fakeSubscriptions)
            // порядок аргументов в репозитории: сначала id записи, потом id пользователя
            expect(mockSubscriptionRepository.findAllByEnrollmentIdAndUserId).toHaveBeenCalledWith(3, 5)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete pending enrollment of the user", async () => {
            mockEnrollmentRepository.deletePendingByIdAndUserId.mockResolvedValue(true)

            await service.delete(5, 3)

            expect(mockEnrollmentRepository.deletePendingByIdAndUserId).toHaveBeenCalledWith(3, 5)
        })

        it("should throw NotFoundException when pending enrollment is not found", async () => {
            mockEnrollmentRepository.deletePendingByIdAndUserId.mockResolvedValue(false)

            await expect(service.delete(5, 99)).rejects.toThrow(NotFoundException)
        })
    })
})