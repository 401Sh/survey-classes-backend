import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { PaymentStatus } from "../enums/payment-status.enum"
import { IManageSubscriptionsService } from "../interfaces/manage-subscriptions-service.interface"
import {
    CreateAttendanceBodyDto,
    GetManageSubscriptionListQueryDto,
    PayFullPriceSubscriptionPaymentBodyDto,
    RefundSubscriptionPaymentBodyDto,
} from "../dto"
import { SubscriptionRepository } from "../abstracts/subscription-repository.abstract"
import { AttendanceRepository, SubscriptionSessions } from "../abstracts/attendance-repository.abstract"


@Injectable()
export class ManageSubscriptionsService implements IManageSubscriptionsService {
    private readonly logger = new Logger(ManageSubscriptionsService.name)

    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly attendanceRepository: AttendanceRepository,
    ) {}

    async createAttendance(subscriptionId: number, data: CreateAttendanceBodyDto) {
        const { isPresent } = data

        const subscription = await this.subscriptionRepository.findById(subscriptionId)

        if (!subscription) throw new NotFoundException("Subscription not found")

        if (!subscription.isActive) {
            throw new BadRequestException("Cannot create attendance for inactive subscription")
        }

        // change sessionsLeft only if the child was present
        let sessions: SubscriptionSessions | undefined

        if (isPresent) {
            const newSessionsLeft = subscription.sessionsLeft - 1

            // if sessionsLeft is equal to zero - change isActive status to false
            sessions = {
                sessionsLeft: newSessionsLeft,
                isActive: newSessionsLeft > 0,
            }
        }

        const attendance = await this.attendanceRepository.createWithSessions(subscriptionId, data, sessions)

        this.logger.log(`Created new attendance for subscription: ${subscriptionId}`)
        this.logger.debug("Created new attendance: ", attendance)
        return attendance
    }


    async findAll(query: GetManageSubscriptionListQueryDto) {
        const [subscriptions, totalCount] = await this.subscriptionRepository.findPage(query)
        const totalPagesAmount = Math.ceil(totalCount / query.limit)

        this.logger.debug("Get subscription list: ", subscriptions)
        return {
            data: subscriptions,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: query.page,
            },
        }
    }


    async findById(id: number) {
        const subscription = await this.subscriptionRepository.findByIdWithDetails(id)

        if (!subscription) {
            this.logger.log(`No subscription with id: ${id}`)
            throw new NotFoundException(`Subscription with id ${id} not found`)
        }

        this.logger.log(`Finded subscription with id: ${id}`)
        this.logger.debug("Get subscription: ", subscription)
        return subscription
    }


    async payFullPrice(subscriptionId: number, data: PayFullPriceSubscriptionPaymentBodyDto) {
        const subscription = await this.subscriptionRepository.findById(subscriptionId)

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
            subscriptionId,
            {
                paymentStatus: PaymentStatus.PAID,
                paidAmount: subscription.priceSnapshot,
                ...data,
            },
        )

        if (!updateResult) {
            this.logger.debug(`Cannot update subscription payment with id: ${subscriptionId}`)
            throw new NotFoundException("Subscription not found")
        }
    }


    async refund(subscriptionId: number, data: RefundSubscriptionPaymentBodyDto) {
        const subscription = await this.subscriptionRepository.findById(subscriptionId)

        if (!subscription) throw new NotFoundException(`Subscription with id ${subscriptionId} not found`)

        if (subscription.paymentStatus !== PaymentStatus.PAID) {
            throw new BadRequestException("Only paid subscriptions can be refunded")
        }

        const updateResult = await this.subscriptionRepository.update(
            subscriptionId,
            {
                paymentStatus: PaymentStatus.REFUNDED,
                refundedAmount: subscription.paidAmount,
                isActive: false,
                ...data,
            },
        )

        if (!updateResult) {
            this.logger.debug(`Cannot update subscription payment with id: ${subscriptionId}`)
            throw new NotFoundException("Subscription not found")
        }
    }
}