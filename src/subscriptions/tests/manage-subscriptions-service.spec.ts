import { NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { AttendanceEntity } from "../entities/attendance.entity"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { PaymentStatus } from "../enums/payment-status.enum"
import { ManageSubscriptionsService } from "../services/manage-subscriptions.service"
import { SortDirection } from "src/common/enums/sort-direction.enum"

const createTransactionManagerMock = () => ({
    findOne: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
})

const createQueryBuilderMock = () => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
})

const mockSubscriptionRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
    createQueryBuilder: vi.fn(),
    manager: {
        transaction: vi.fn(),
    },
}

describe("ManageSubscriptionsService", () => {
    let service: ManageSubscriptionsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageSubscriptionsService,
                {
                    provide: getRepositoryToken(SubscriptionEntity),
                    useValue: mockSubscriptionRepository,
                },
            ],
        }).compile()

        service = module.get<ManageSubscriptionsService>(ManageSubscriptionsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("createAttendance", () => {
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockSubscriptionRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<void>) => cb(managerMock)
            )
        }

        it("should create attendance without changing sessionsLeft when isPresent is false", async () => {
            const manager = createTransactionManagerMock()
            const fakeSubscription = {
                id: 1,
                isActive: true,
                sessionsLeft: 3,
            } as unknown as SubscriptionEntity
            const fakeAttendance = { id: 1, isPresent: false } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeSubscription)
            manager.save.mockResolvedValue(fakeAttendance)

            const result = await service.createAttendance(1, { isPresent: false, date: new Date("2023-01-01") })

            expect(result).toEqual(fakeAttendance)
            expect(manager.update).not.toHaveBeenCalled()
        })

        it("should decrement sessionsLeft when isPresent is true", async () => {
            const manager = createTransactionManagerMock()
            const fakeSubscription = {
                id: 1,
                isActive: true,
                sessionsLeft: 3,
            } as unknown as SubscriptionEntity
            const fakeAttendance = { id: 1, isPresent: true } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeSubscription)
            manager.save.mockResolvedValue(fakeAttendance)

            await service.createAttendance(1, { isPresent: true, date: new Date("2023-01-01") })

            expect(manager.update).toHaveBeenCalledWith(
                SubscriptionEntity,
                { id: 1 },
                { sessionsLeft: 2, isActive: true }
            )
        })

        it("should set isActive to false when sessionsLeft reaches zero", async () => {
            const manager = createTransactionManagerMock()
            const fakeSubscription = {
                id: 1,
                isActive: true,
                sessionsLeft: 1, // последняя сессия
            } as unknown as SubscriptionEntity
            const fakeAttendance = { id: 1, isPresent: true } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeSubscription)
            manager.save.mockResolvedValue(fakeAttendance)

            await service.createAttendance(1, { isPresent: true, date: new Date("2023-01-01") })

            expect(manager.update).toHaveBeenCalledWith(
                SubscriptionEntity,
                { id: 1 },
                { sessionsLeft: 0, isActive: false }
            )
        })

        it("should throw NotFoundException when subscription does not exist", async () => {
            const manager = createTransactionManagerMock()
            setupTransaction(manager)
            manager.findOne.mockResolvedValue(null)

            await expect(service.createAttendance(99, { isPresent: true, date: new Date("2023-01-01") }))
                .rejects.toThrow(NotFoundException)
        })

        it("should throw BadRequestException when subscription is inactive", async () => {
            const manager = createTransactionManagerMock()
            const fakeSubscription = {
                id: 1,
                isActive: false,
                sessionsLeft: 0,
            } as unknown as SubscriptionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeSubscription)

            await expect(service.createAttendance(1, { isPresent: true, date: new Date("2023-01-01") }))
                .rejects.toThrow(BadRequestException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        const baseQuery = {
            page: 1,
            limit: 10,
            sortDirection: SortDirection.DESC,
        }

        it("should return paginated result", async () => {
            const fakeSubscriptions = [{ id: 1 }, { id: 2 }] as unknown as SubscriptionEntity[]
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([fakeSubscriptions, 2])
            mockSubscriptionRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll(baseQuery)

            expect(result.data).toEqual(fakeSubscriptions)
            expect(result.meta).toEqual({
                totalCount: 2,
                totalPagesAmount: 1,
                currentPage: 1,
            })
        })

        it("should calculate totalPagesAmount correctly", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 25])
            mockSubscriptionRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll({ ...baseQuery, limit: 10 })

            expect(result.meta.totalPagesAmount).toBe(3)
        })

        it("should apply paymentStatus filter when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockSubscriptionRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, paymentStatus: PaymentStatus.PAID })

            expect(qb.where).toHaveBeenCalledWith(
                "subscriptions.paymentStatus = :paymentStatus",
                { paymentStatus: PaymentStatus.PAID }
            )
        })

        it("should apply dateFrom and dateTo filters when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockSubscriptionRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, dateFrom: new Date("2024-01-01"), dateTo: new Date("2024-12-31") })

            expect(qb.andWhere).toHaveBeenCalledWith(
                "subscriptions.createdAt >= :dateFrom",
                { dateFrom: new Date("2024-01-01") }
            )
            expect(qb.andWhere).toHaveBeenCalledWith(
                "subscriptions.createdAt <= :dateTo",
                { dateTo: new Date("2024-12-31") }
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return subscription when it exists", async () => {
            const fakeSubscription = { id: 1 } as unknown as SubscriptionEntity
            mockSubscriptionRepository.findOne.mockResolvedValue(fakeSubscription)

            const result = await service.findById(1)

            expect(result).toEqual(fakeSubscription)
        })

        it("should throw NotFoundException when subscription does not exist", async () => {
            mockSubscriptionRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("payFullPrice", () => {
        it("should update payment status to PAID", async () => {
            const fakeSubscription = {
                id: 1,
                isActive: true,
                paymentStatus: PaymentStatus.UNPAID,
                priceSnapshot: 1000,
                pricingTier: { id: 1 },
            } as unknown as SubscriptionEntity

            mockSubscriptionRepository.findOne.mockResolvedValue(fakeSubscription)
            mockSubscriptionRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.payFullPrice(1, { paidAt: new Date() })).resolves.not.toThrow()

            expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                expect.objectContaining({ paymentStatus: PaymentStatus.PAID })
            )
        })

        it("should throw NotFoundException when subscription does not exist", async () => {
            mockSubscriptionRepository.findOne.mockResolvedValue(null)

            await expect(service.payFullPrice(99, { paidAt: new Date() }))
                .rejects.toThrow(NotFoundException)
        })

        it("should throw ConflictException when subscription is already paid", async () => {
            const fakeSubscription = {
                id: 1,
                isActive: true,
                paymentStatus: PaymentStatus.PAID,
            } as unknown as SubscriptionEntity

            mockSubscriptionRepository.findOne.mockResolvedValue(fakeSubscription)

            await expect(service.payFullPrice(1, { paidAt: new Date() }))
                .rejects.toThrow(ConflictException)
        })

        it("should throw ConflictException when subscription is refunded", async () => {
            const fakeSubscription = {
                id: 1,
                isActive: false,
                paymentStatus: PaymentStatus.REFUNDED,
            } as unknown as SubscriptionEntity

            mockSubscriptionRepository.findOne.mockResolvedValue(fakeSubscription)

            await expect(service.payFullPrice(1, { paidAt: new Date() }))
                .rejects.toThrow(ConflictException)
        })

        it("should throw BadRequestException when subscription is inactive", async () => {
            const fakeSubscription = {
                id: 1,
                isActive: false,
                paymentStatus: PaymentStatus.UNPAID,
            } as unknown as SubscriptionEntity

            mockSubscriptionRepository.findOne.mockResolvedValue(fakeSubscription)

            await expect(service.payFullPrice(1, { paidAt: new Date() }))
                .rejects.toThrow(BadRequestException)
        })
    })

    // -------------------------------------------------------------------------

    describe("refund", () => {
        it("should update payment status to REFUNDED", async () => {
            const fakeSubscription = {
                id: 1,
                isActive: true,
                paymentStatus: PaymentStatus.PAID,
                paidAmount: 1000,
            } as unknown as SubscriptionEntity

            mockSubscriptionRepository.findOne.mockResolvedValue(fakeSubscription)
            mockSubscriptionRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.refund(1, { refundedAt: new Date() })).resolves.not.toThrow()

            expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                expect.objectContaining({
                    paymentStatus: PaymentStatus.REFUNDED,
                    isActive: false,
                })
            )
        })

        it("should throw NotFoundException when subscription does not exist", async () => {
            mockSubscriptionRepository.findOne.mockResolvedValue(null)

            await expect(service.refund(99, { refundedAt: new Date() }))
                .rejects.toThrow(NotFoundException)
        })

        it("should throw BadRequestException when subscription is not paid", async () => {
            const fakeSubscription = {
                id: 1,
                paymentStatus: PaymentStatus.UNPAID,
            } as unknown as SubscriptionEntity

            mockSubscriptionRepository.findOne.mockResolvedValue(fakeSubscription)

            await expect(service.refund(1, { refundedAt: new Date() }))
                .rejects.toThrow(BadRequestException)
        })

        it("should save paidAmount as refundedAmount", async () => {
            const fakeSubscription = {
                id: 1,
                isActive: true,
                paymentStatus: PaymentStatus.PAID,
                paidAmount: 1500,
            } as unknown as SubscriptionEntity

            mockSubscriptionRepository.findOne.mockResolvedValue(fakeSubscription)
            mockSubscriptionRepository.update.mockResolvedValue({ affected: 1 })

            await service.refund(1, { refundedAt: new Date() })

            expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                expect.objectContaining({ refundedAmount: 1500 })
            )
        })
    })
})