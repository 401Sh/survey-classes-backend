import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { Repository } from "typeorm"
import { UpdateSubscriptionPaymentBodyDto } from "../dto/update-subscription-body.dto"
import { GetManageSubscriptionListQueryDto } from "../dto/get-manage-subscription-list-query.dto"
import { PaymentStatus } from "../enums/payment-status.enum"

@Injectable()
export class ManageSubscriptionsService {
    private readonly logger = new Logger(ManageSubscriptionsService.name)

    constructor(
        @InjectRepository(SubscriptionEntity)
        private subscriptionRepository: Repository<SubscriptionEntity>,
    ) {}

    async findAll(query: GetManageSubscriptionListQueryDto) {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            paymentStatus,
            pricingTierId,
            enrollmentId,
            sortDirection,
        } = query

        const queryBuilder = this.subscriptionRepository.createQueryBuilder("subscriptions")

        queryBuilder.leftJoinAndSelect("subscriptions.pricingTier", "pricingTiers")
        queryBuilder.leftJoinAndSelect("subscriptions.enrollment", "enrollments")

        if (paymentStatus) {
            queryBuilder.where("subscriptions.paymentStatus = :paymentStatus", { paymentStatus })
        }

        if (dateFrom) {
            queryBuilder.andWhere("subscriptions.createdAt >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("subscriptions.createdAt <= :dateTo", { dateTo })
        }

        if (pricingTierId) {
            queryBuilder.andWhere("pricingTiers.id = :pricingTierId", { pricingTierId })
        }

        if (enrollmentId) {
            queryBuilder.andWhere("enrollments.id = :enrollmentId", { enrollmentId })
        }

        queryBuilder.orderBy("subscriptions.createdAt", sortDirection)
        queryBuilder.skip((page - 1) * limit).take(limit)

        const [subscriptions, totalCount] = await queryBuilder.getManyAndCount()
        const totalPagesAmount = Math.ceil(totalCount / limit)

        this.logger.debug("Get subscription list: ", subscriptions)
        return {
            data: subscriptions,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: page,
            },
        }
    }


    async findById(id: number) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { id },
            relations: {
                enrollment: {
                    user: true,
                    child: true,
                },
                pricingTier: true,
            },
        })

        if (!subscription) {
            this.logger.log(`No subscription with id: ${id}`)
            throw new NotFoundException(`Subscription with id ${id} not found`)
        }

        this.logger.log(`Finded subscription with id: ${id}`)
        this.logger.debug("Get subscription: ", subscription)
        return subscription
    }


    async payFullPrice(subscriptionId: number, data: UpdateSubscriptionPaymentBodyDto) {
        const { paidAt } = data

        const subscription = await this.subscriptionRepository.findOne({
            where: { id: subscriptionId },
            relations: { pricingTier: true },
        })

        if (!subscription || !subscription.pricingTier) {
            throw new NotFoundException(`Subscription with id ${subscriptionId} not found`)
        }

        if (subscription.paymentStatus == PaymentStatus.PAID) {
            throw new ConflictException(`Subscription weith id ${subscriptionId} has already been paid`)
        }

        const updateResult = await this.subscriptionRepository.update(
            { id: subscriptionId },
            {
                paymentStatus: PaymentStatus.PAID,
                paidAmount: subscription.priceSnapshot,
                paidAt: paidAt,
            }
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update subscription payment with id: ${subscriptionId}`)
            throw new NotFoundException("Subscription not found")
        }

        return updateResult
    }
}