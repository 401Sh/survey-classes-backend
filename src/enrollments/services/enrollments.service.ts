import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { EnrollmentMode } from "src/lessons/enums/enrollment-mode.enum"
import { ChildrenInternalService } from "src/users/services/children-internal.service"
import { LessonsInternalService } from "src/lessons/services/lessons-internal.service"
import { LessonPricingTiersInternalService } from "src/lessons/services/lesson-pricing-tiers-internal.service"
import { IEnrollmentsService } from "../interfaces/enrollments-service.interface"
import { CreateEnrollmentBodyDto, CreateEnrollmentSubscriptionBodyDto, GetEnrollmentListQueryDto } from "../dto"
import { EnrollmentRepository } from "../abstracts/enrollment-repository.abstract"
import { SubscriptionRepository } from "../abstracts/subscription-repository.abstract"

@Injectable()
export class EnrollmentsService implements IEnrollmentsService {
    private readonly logger = new Logger(EnrollmentsService.name)

    constructor(
        private readonly enrollmentRepository: EnrollmentRepository,
        private readonly subscriptionRepository: SubscriptionRepository,

        private readonly childrenService: ChildrenInternalService,
        private readonly lessonsService: LessonsInternalService,
        private readonly pricingTiersService: LessonPricingTiersInternalService,
    ) {}

    async create(userId: number, data: CreateEnrollmentBodyDto) {
        const { lessonId, childId } = data

        // check that the child belongs to the user
        await this.validateChildOwnership(childId, userId)

        // check and get lesson
        const lesson = await this.lessonsService.findSimplified(lessonId)

        // check that there's no active enrollment
        await this.validateActiveEnrollmentExisting(lessonId, childId)

        // check status by lesson EnrollmentMode
        const status = (lesson.enrollmentMode === EnrollmentMode.AUTO)
            ? EnrollmentStatus.ACTIVE
            : EnrollmentStatus.PENDING

        const enrollment = await this.enrollmentRepository.create({
            userId,
            status,
            enrolledAt: new Date(),
            ...data,
        })

        this.logger.log(`Created child ${childId} enrollment for lesson ${lessonId}`)
        return enrollment
    }


    async createSubscription(userId: number, enrollmentId: number, data: CreateEnrollmentSubscriptionBodyDto) {
        const { pricingTierId } = data

        // check and get enrollment with
        const enrollment = await this.getEnrollmentOrThrow(userId, enrollmentId)

        if (enrollment.status !== EnrollmentStatus.ACTIVE) {
            throw new BadRequestException("Cannot create subscription for non-active enrollment")
        }

        // check and get pricingTier
        const lessonId = enrollment.lesson.id
        const pricingTier = await this.pricingTiersService.findActiveAndLinked(pricingTierId, lessonId)

        const subscription = await this.bareCreateSubscription(
            enrollment.id,
            pricingTierId,
            pricingTier.price,
            pricingTier.sessionsCount,
        )

        this.logger.log(`Created subscription with pricingTier ${pricingTierId} for enrollment ${enrollmentId}`)
        return subscription
    }


    async findAll(userId: number, query: GetEnrollmentListQueryDto) {
        const [enrollments, totalCount] = await this.enrollmentRepository.findPageByUserId(userId, query)
        const totalPagesAmount = Math.ceil(totalCount / query.limit)

        this.logger.debug("Get enrollment list: ", enrollments)
        return {
            data: enrollments,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: query.page,
            },
        }
    }


    async findById(userId: number, enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findByIdAndUserIdWithDetails(enrollmentId, userId)

        if (!enrollment) {
            this.logger.log(`No enrollment with id: ${enrollmentId}`)
            throw new NotFoundException(`Enrollment with id ${enrollmentId} not found`)
        }

        this.logger.log(`Finded enrollment with id: ${enrollmentId}`)
        return enrollment
    }


    async findAllSubscriptionsByEnrollmentId(userId: number, enrollmentId: number) {
        const subscriptions = await this.findAllSubscriptionsByEnrollmentIdAndUserId(userId, enrollmentId)

        return subscriptions
    }


    async delete(userId: number, enrollmentId: number) {
        this.logger.log(`Deleting pending enrollment with id: ${enrollmentId}`)
        const deleteResult = await this.enrollmentRepository.deletePendingByIdAndUserId(enrollmentId, userId)

        if (!deleteResult) {
            this.logger.log(`Cannot delete enrollment. No pending enrollment with id: ${enrollmentId}`)
            throw new NotFoundException(`Pending enrollment with id ${enrollmentId} not found`)
        }
    }


    private async validateChildOwnership(childId: number, userId: number) {
        const exists = await this.childrenService.existsAndOwnedBy(childId, userId)

        if (!exists) {
            throw new NotFoundException("Child not found")
        }
    }


    private async validateActiveEnrollmentExisting(lessonId: number, childId: number) {
        const isEnrollmentExists = await this.enrollmentRepository.existsNotSuspendedByLessonIdAndChildId(
            lessonId,
            childId,
        )

        if (isEnrollmentExists) {
            throw new BadRequestException("Child is already enrolled in this lesson")
        }
    }


    private async getEnrollmentOrThrow(userId: number, enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findActiveByIdAndUserIdWithLesson(
            enrollmentId,
            userId,
        )

        if (!enrollment) {
            throw new NotFoundException("Enrollment not found")
        }

        return enrollment
    }


    private async findAllSubscriptionsByEnrollmentIdAndUserId(userId: number, enrollmentId: number) {
        const subscriptions = await this.subscriptionRepository.findAllByEnrollmentIdAndUserId(enrollmentId, userId)

        this.logger.debug("Get subscription list: ", subscriptions)
        return subscriptions
    }


    private async bareCreateSubscription(
        enrollmentId: number,
        pricingTierId: number,
        price: number,
        sessionsCount: number,
    ) {
        const subscription = await this.subscriptionRepository.create(
            enrollmentId,
            pricingTierId,
            {
                priceSnapshot: price,
                sessionsTotal: sessionsCount,
                sessionsLeft: sessionsCount,
            },
        )

        this.logger.log(`Created new subscription for enrollmentId: ${enrollmentId}`)
        this.logger.debug("Created new subscription: ", subscription)
        return subscription
    }
}