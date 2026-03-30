import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { Repository } from "typeorm"
import { GetManageSubscriptionListQueryDto } from "../dto/get-manage-subscription-list-query.dto"
import { PaymentStatus } from "../enums/payment-status.enum"
import { PayFullPriceSubscriptionPaymentBodyDto } from "../dto/pay-full-price-subscription-payment-body.dto"
import { RefundSubscriptionPaymentBodyDto } from "../dto/refund-subscription-payment-body.dto"
import { CreateAttendanceBodyDto } from "../dto/create-attendance-body.dto"
import { AttendanceEntity } from "../entities/attendance.entity"

@Injectable()
export class ManageSubscriptionsService {
    private readonly logger = new Logger(ManageSubscriptionsService.name)

    constructor(
        @InjectRepository(SubscriptionEntity)
        private subscriptionRepository: Repository<SubscriptionEntity>,
    ) {}

    async createAttendance(subscriptionId: number, data: CreateAttendanceBodyDto) {
        const { isPresent } = data

        const attendance = await this.subscriptionRepository.manager.transaction(async (manager) => {
            const subscription = await manager.findOne(SubscriptionEntity,
                {
                    where: { id: subscriptionId },
                }
            )
        
            if (!subscription) throw new NotFoundException("Subscription not found")

            if (!subscription.isActive) {
                throw new BadRequestException("Cannot create attendance for inactive subscription")
            }

            const attendance = await manager.save(AttendanceEntity,
                {
                    ...data,
                    subscription: { id: subscriptionId },
                }
            )

            // change sessionsLeft
            if (isPresent) {
                const newSessionsLeft = subscription.sessionsLeft - 1

                // if sessionsLeft is equal to zero - change isActive status to false
                await manager.update(SubscriptionEntity,
                    { id: subscription.id },
                    {
                        sessionsLeft: newSessionsLeft,
                        isActive: newSessionsLeft > 0,
                    },
                )
            }

            return attendance
        })

        this.logger.log(`Created new attendance for subscription: ${subscriptionId}`)
        this.logger.debug("Created new attendance: ", attendance)
        return attendance
    }


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


    async payFullPrice(subscriptionId: number, data: PayFullPriceSubscriptionPaymentBodyDto) {
        const { paidAt } = data

        const subscription = await this.subscriptionRepository.findOne({
            where: { id: subscriptionId },
            relations: { pricingTier: true },
        })

        if (!subscription) {
            throw new NotFoundException(`Subscription with id ${subscriptionId} not found`)
        }

        if (subscription.paymentStatus == PaymentStatus.PAID) {
            throw new ConflictException(`Subscription weith id ${subscriptionId} has already been paid`)
        }

        if (subscription.paymentStatus === PaymentStatus.REFUNDED) {
            throw new ConflictException("Cannot pay refunded subscription")
        }

        if (!subscription.isActive) {
            throw new BadRequestException("Cannot pay inactive subscription")
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


    async refund(subscriptionId: number, data: RefundSubscriptionPaymentBodyDto) {
        const { refundedAt } = data

        const subscription = await this.subscriptionRepository.findOne({
            where: { id: subscriptionId },
        })

        if (!subscription) throw new NotFoundException(`Subscription with id ${subscriptionId} not found`)

        if (subscription.paymentStatus !== PaymentStatus.PAID) {
            throw new BadRequestException("Only paid subscriptions can be refunded")
        }

        await this.subscriptionRepository.update({ id: subscriptionId }, {
            paymentStatus: PaymentStatus.REFUNDED,
            refundedAmount: subscription.paidAmount,
            refundedAt: refundedAt,
            isActive: false,
        })
    }
}