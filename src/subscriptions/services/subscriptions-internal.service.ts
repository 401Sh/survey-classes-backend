import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { Repository } from "typeorm"

@Injectable()
export class SubscriptionsInternalService {
    private readonly logger = new Logger(SubscriptionsInternalService.name)

    constructor(
        @InjectRepository(SubscriptionEntity)
        private subscriptionRepository: Repository<SubscriptionEntity>,
    ) {}

    async findAllOwnedByEnrollmentId(userId: number, enrollmentId: number) {
        const subscriptions = await this.subscriptionRepository.find({
            where: {
                enrollment: {
                    id: enrollmentId,
                    user: { id: userId },
                }
            },
            select: {
                id: true,
                paymentStatus: true,
                priceSnapshot: true,
                paidAmount: true,
                sessionsTotal: true,
                sessionsLeft: true,
                pricingTier: {
                    id: true,
                    label: true,
                    sessionsCount: true,
                },
            },
            relations: {
                pricingTier: true,
            },
        })

        this.logger.debug("Get subscription list: ", subscriptions)
        return subscriptions
    }


    async bareCreate(enrollmentId: number, pricingTierId: number, price: number, sessionsCount: number) {
        const subscription = await this.subscriptionRepository.save({
            enrollment: { id: enrollmentId },
            pricingTier: { id: pricingTierId },
            priceSnapshot: price,
            sessionsTotal: sessionsCount,
            sessionsLeft: sessionsCount,
        })

        this.logger.log(`Created new subscription for enrollmentId: ${enrollmentId}`)
        this.logger.debug("Created new subscription: ", subscription)
        return subscription
    }
}