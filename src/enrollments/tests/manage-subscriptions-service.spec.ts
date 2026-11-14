import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { AttendanceEntity } from "../entities/attendance.entity"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { PaymentStatus } from "../enums/payment-status.enum"
import { AttendanceRepository } from "../abstracts/attendance-repository.abstract"
import { SubscriptionRepository } from "../abstracts/subscription-repository.abstract"
import { CreateAttendanceBodyDto, GetManageSubscriptionListQueryDto } from "../dto"
import { ManageSubscriptionsService } from "../services/manage-subscriptions.service"

const mockSubscriptionRepository = {
    findById: vi.fn(),
    findByIdWithDetails: vi.fn(),
    findPage: vi.fn(),
    update: vi.fn(),
}

const mockAttendanceRepository = {
    createWithSessions: vi.fn(),
}

describe("ManageSubscriptionsService", () => {
    let service: ManageSubscriptionsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageSubscriptionsService,
                { provide: SubscriptionRepository, useValue: mockSubscriptionRepository },
                { provide: AttendanceRepository, useValue: mockAttendanceRepository },
            ],
        }).compile()

        service = module.get(ManageSubscriptionsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("createAttendance", () => {
        const date = new Date("2026-01-10")

        it("should spend one session when child was present", async () => {
            const data = { date, isPresent: true } as CreateAttendanceBodyDto
            const fakeAttendance = { id: 1 } as AttendanceEntity
            mockSubscriptionRepository.findById.mockResolvedValue({ id: 1, isActive: true, sessionsLeft: 5 })
            mockAttendanceRepository.createWithSessions.mockResolvedValue(fakeAttendance)

            const result = await service.createAttendance(1, data)

            expect(result).toEqual(fakeAttendance)
            expect(mockAttendanceRepository.createWithSessions).toHaveBeenCalledWith(
                1,
                data,
                { sessionsLeft: 4, isActive: true }
            )
        })

        it("should not change sessions when child was absent", async () => {
            const data = { date, isPresent: false } as CreateAttendanceBodyDto
            mockSubscriptionRepository.findById.mockResolvedValue({ id: 1, isActive: true, sessionsLeft: 5 })
            mockAttendanceRepository.createWithSessions.mockResolvedValue({ id: 1 })

            await service.createAttendance(1, data)

            expect(mockAttendanceRepository.createWithSessions).toHaveBeenCalledWith(1, data, undefined)
        })

        it("should deactivate subscription when the last session is spent", async () => {
            const data = { date, isPresent: true } as CreateAttendanceBodyDto
            mockSubscriptionRepository.findById.mockResolvedValue({ id: 1, isActive: true, sessionsLeft: 1 })
            mockAttendanceRepository.createWithSessions.mockResolvedValue({ id: 1 })

            await service.createAttendance(1, data)

            expect(mockAttendanceRepository.createWithSessions).toHaveBeenCalledWith(
                1,
                data,
                { sessionsLeft: 0, isActive: false }
            )
        })

        it("should throw NotFoundException when subscription does not exist", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue(null)

            await expect(
                service.createAttendance(99, { date, isPresent: true } as CreateAttendanceBodyDto)
            ).rejects.toThrow(NotFoundException)
            expect(mockAttendanceRepository.createWithSessions).not.toHaveBeenCalled()
        })

        it("should throw BadRequestException when subscription is inactive", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue({ id: 1, isActive: false, sessionsLeft: 0 })

            await expect(
                service.createAttendance(1, { date, isPresent: true } as CreateAttendanceBodyDto)
            ).rejects.toThrow(BadRequestException)
            expect(mockAttendanceRepository.createWithSessions).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        it("should return subscriptions with pagination meta", async () => {
            const query = { page: 1, limit: 10, sortDirection: SortDirection.ASC } as GetManageSubscriptionListQueryDto
            const fakeSubscriptions = [{ id: 1 }] as SubscriptionEntity[]
            mockSubscriptionRepository.findPage.mockResolvedValue([fakeSubscriptions, 30])

            const result = await service.findAll(query)

            expect(mockSubscriptionRepository.findPage).toHaveBeenCalledWith(query)
            expect(result).toEqual({
                data: fakeSubscriptions,
                meta: { totalCount: 30, totalPagesAmount: 3, currentPage: 1 },
            })
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return subscription when it exists", async () => {
            const fakeSubscription = { id: 1 } as SubscriptionEntity
            mockSubscriptionRepository.findByIdWithDetails.mockResolvedValue(fakeSubscription)

            const result = await service.findById(1)

            expect(result).toEqual(fakeSubscription)
        })

        it("should throw NotFoundException when subscription does not exist", async () => {
            mockSubscriptionRepository.findByIdWithDetails.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("payFullPrice", () => {
        const paidAt = new Date("2026-02-01")

        it("should mark subscription as paid with full price", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue({
                id: 1,
                isActive: true,
                paymentStatus: PaymentStatus.UNPAID,
                priceSnapshot: 1500,
            })
            mockSubscriptionRepository.update.mockResolvedValue(true)

            await service.payFullPrice(1, { paidAt })

            expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(1, {
                paymentStatus: PaymentStatus.PAID,
                paidAmount: 1500,
                paidAt,
            })
        })

        it("should throw NotFoundException when subscription does not exist", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue(null)

            await expect(service.payFullPrice(99, { paidAt })).rejects.toThrow(NotFoundException)
        })

        it("should throw ConflictException when subscription is already paid", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue({
                id: 1,
                isActive: true,
                paymentStatus: PaymentStatus.PAID,
            })

            await expect(service.payFullPrice(1, { paidAt })).rejects.toThrow(ConflictException)
            expect(mockSubscriptionRepository.update).not.toHaveBeenCalled()
        })

        it("should throw ConflictException when subscription is refunded", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue({
                id: 1,
                isActive: false,
                paymentStatus: PaymentStatus.REFUNDED,
            })

            await expect(service.payFullPrice(1, { paidAt })).rejects.toThrow(ConflictException)
            expect(mockSubscriptionRepository.update).not.toHaveBeenCalled()
        })

        it("should throw BadRequestException when subscription is inactive", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue({
                id: 1,
                isActive: false,
                paymentStatus: PaymentStatus.UNPAID,
            })

            await expect(service.payFullPrice(1, { paidAt })).rejects.toThrow(BadRequestException)
            expect(mockSubscriptionRepository.update).not.toHaveBeenCalled()
        })

        it("should throw NotFoundException when repository did not update anything", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue({
                id: 1,
                isActive: true,
                paymentStatus: PaymentStatus.UNPAID,
                priceSnapshot: 1500,
            })
            mockSubscriptionRepository.update.mockResolvedValue(false)

            await expect(service.payFullPrice(1, { paidAt })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("refund", () => {
        const refundedAt = new Date("2026-03-01")

        it("should refund paid subscription and deactivate it", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue({
                id: 1,
                paymentStatus: PaymentStatus.PAID,
                paidAmount: 1500,
            })
            mockSubscriptionRepository.update.mockResolvedValue(true)

            await service.refund(1, { refundedAt })

            expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(1, {
                paymentStatus: PaymentStatus.REFUNDED,
                refundedAmount: 1500,
                isActive: false,
                refundedAt,
            })
        })

        it("should throw NotFoundException when subscription does not exist", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue(null)

            await expect(service.refund(99, { refundedAt })).rejects.toThrow(NotFoundException)
        })

        it.each([PaymentStatus.UNPAID, PaymentStatus.REFUNDED])(
            "should throw BadRequestException when subscription is %s",
            async (paymentStatus) => {
                mockSubscriptionRepository.findById.mockResolvedValue({ id: 1, paymentStatus })

                await expect(service.refund(1, { refundedAt })).rejects.toThrow(BadRequestException)
                expect(mockSubscriptionRepository.update).not.toHaveBeenCalled()
            }
        )

        it("should throw NotFoundException when repository did not update anything", async () => {
            mockSubscriptionRepository.findById.mockResolvedValue({
                id: 1,
                paymentStatus: PaymentStatus.PAID,
                paidAmount: 1500,
            })
            mockSubscriptionRepository.update.mockResolvedValue(false)

            await expect(service.refund(1, { refundedAt })).rejects.toThrow(NotFoundException)
        })
    })
})