import { SubscriptionEntity } from "../entities/subscription.entity"

export interface ISubscriptionsInternalService {
    findAllByEnrollmentIdAndUserId(userId: number, enrollmentId: number): Promise<SubscriptionEntity[]>
    bareCreate(
        enrollmentId: number,
        pricingTierId: number,
        price: number,
        sessionsCount: number,
    ): Promise<SubscriptionEntity>
}