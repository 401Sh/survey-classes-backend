import { Injectable } from "@nestjs/common"
import {
    CreateSubscriptionData,
    SubscriptionListFilters,
    SubscriptionRepository,
    SubscriptionUpdateData,
} from "../abstracts/subscription-repository.abstract"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

@Injectable()
export class TypeOrmSubscriptionRepository implements SubscriptionRepository {
    constructor(
        @InjectRepository(SubscriptionEntity)
        private subscriptionRepository: Repository<SubscriptionEntity>,
    ) {}

    async create(
        enrollmentId: number,
        pricingTierId: number,
        data: CreateSubscriptionData,
    ): Promise<SubscriptionEntity> {
        const subscription = await this.subscriptionRepository.save({
            ...data,
            enrollment: { id: enrollmentId },
            pricingTier: { id: pricingTierId },
        })

        return subscription
    }


    async findById(id: number): Promise<SubscriptionEntity | null> {
        const subscription = await this.subscriptionRepository.findOne({
            where: { id },
        })

        return subscription
    }


    async findByIdWithDetails(id: number): Promise<SubscriptionEntity | null> {
        const subscription = await this.subscriptionRepository.findOne({
            where: { id },
            relations: {
                enrollment: {
                    user: true,
                    child: true,
                },
                pricingTier: true,
                attendances: true,
            },
        })

        return subscription
    }


    async findAllByEnrollmentIdAndUserId(enrollmentId: number, userId: number): Promise<SubscriptionEntity[]> {
        const subscriptions = await this.subscriptionRepository.find({
            where: {
                enrollment: {
                    id: enrollmentId,
                    user: { id: userId },
                },
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

        return subscriptions
    }


    async findPage(filters: SubscriptionListFilters): Promise<[SubscriptionEntity[], number]> {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            paymentStatus,
            pricingTierId,
            enrollmentId,
            sortDirection,
        } = filters

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

        return await queryBuilder.getManyAndCount()
    }


    async update(id: number, data: SubscriptionUpdateData): Promise<boolean> {
        const updateResult = await this.subscriptionRepository.update(
            { id },
            { ...data },
        )

        return (updateResult.affected && updateResult.affected > 0) ? true : false
    }
}