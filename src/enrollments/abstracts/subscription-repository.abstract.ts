import { SortDirection } from "src/common/enums/sort-direction.enum"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { PaymentStatus } from "../enums/payment-status.enum"

export type SubscriptionListFilters = {
    page: number,
    limit: number,
    sortDirection: SortDirection,
    paymentStatus?: PaymentStatus,
    pricingTierId?: number,
    enrollmentId?: number,
    dateFrom?: Date,
    dateTo?: Date,
}

export type CreateSubscriptionData = {
    priceSnapshot: number,
    sessionsTotal: number,
    sessionsLeft: number,
}

export type SubscriptionUpdateData = {
    isActive?: boolean,
    paymentStatus?: PaymentStatus,
    paidAmount?: number,
    paidAt?: Date,
    refundedAmount?: number,
    refundedAt?: Date,
    sessionsLeft?: number,
}

export abstract class SubscriptionRepository {
    // public
    abstract create(
        enrollmentId: number,
        pricingTierId: number,
        data: CreateSubscriptionData,
    ): Promise<SubscriptionEntity>
    abstract findAllByEnrollmentIdAndUserId(enrollmentId: number, userId: number): Promise<SubscriptionEntity[]>

    // manage
    abstract findById(id: number): Promise<SubscriptionEntity | null>
    abstract findByIdWithDetails(id: number): Promise<SubscriptionEntity | null>
    abstract findPage(filters: SubscriptionListFilters): Promise<[SubscriptionEntity[], number]>
    abstract update(id: number, data: SubscriptionUpdateData): Promise<boolean>
}