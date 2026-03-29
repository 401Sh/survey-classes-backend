import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { Not, Repository } from "typeorm"
import { GetEnrollmentListQueryDto } from "../dto/get-enrollment-list-query.dto"
import { CreateEnrollmentBodyDto } from "../dto/create-enrollment-body.dto"
import { UserChildEntity } from "src/users/entities/user-child.entity"
import { ApplicationEntity } from "../entities/application.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { LessonEntity } from "src/lessons/entities/lesson.entity"
import { EnrollmentMode } from "src/lessons/enums/enrollment-mode.enum"
import { CreateSubscriptionBodyDto } from "../dto/create-subscription-body.dto"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { LessonPricingTierEntity } from "src/lessons/entities/lesson-pricing-tier.entity"

@Injectable()
export class EnrollmentsService {
    private readonly logger = new Logger(EnrollmentsService.name)

    constructor(
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
        @InjectRepository(SubscriptionEntity)
        private subscriptionRepository: Repository<SubscriptionEntity>,
        @InjectRepository(UserChildEntity)
        private childRepository: Repository<UserChildEntity>,
        @InjectRepository(LessonEntity)
        private lessonRepository: Repository<LessonEntity>,
        @InjectRepository(LessonPricingTierEntity)
        private pricingTierRepository: Repository<LessonPricingTierEntity>,
    ) {}

    async create(userId: number, data: CreateEnrollmentBodyDto) {
        const { lessonId, childId, consentedAt, isConsented } = data

        // check that the child belongs to the user
        await this.validateChildOwnership(childId, userId)

        // check and get lesson with survey
        const lesson = await this.getLessonWithSurveyOrThrow(lessonId)

        // check that there's no active enrollment
        await this.validateActiveEnrollmentExisting(lessonId, childId)

        // check status by lesson EnrollmentMode
        const status = (lesson.enrollmentMode === EnrollmentMode.AUTO && !lesson.requiresSurvey)
            ? EnrollmentStatus.ACTIVE
            : EnrollmentStatus.PENDING

        const enrollment = await this.enrollmentRepository.save({
            user: { id: userId },
            child: { id: childId },
            lesson: { id: lessonId },
            enrolledAt: new Date(),
            consentedAt,
            isConsented,
            status,
        })

        // If the lesson requires a survey - return the flag so that the front shows the form
        const requiresSurvey = lesson.requiresSurvey && !!lesson.survey

        this.logger.log(`Created child ${childId} enrollment for lesson ${lessonId}`)
        return {
            ...enrollment,
            requiresSurvey,
            surveyId: requiresSurvey ? lesson.survey.id : null,
        }
    }


    async createSubscription(userId: number, enrollmentId: number, data: CreateSubscriptionBodyDto) {
        const { pricingTierId } = data

        // check and get enrollment with
        const enrollment = await this.getEnrollmentOrThrow(userId, enrollmentId)

        if (enrollment.status !== EnrollmentStatus.ACTIVE) {
            throw new BadRequestException("Cannot create subscription for non-active enrollment")
        }

        // check pricingTier existing
        const lessonId = enrollment.lesson.id
        const pricingTier = await this.getPricingTierOrThrow(pricingTierId, lessonId)

        const subscription = await this.subscriptionRepository.save({
            enrollment: { id: enrollmentId },
            pricingTier: { id: pricingTierId },
            priceSnapshot: pricingTier.price,
            sessionsTotal: pricingTier.sessionsCount,
            sessionsLeft: pricingTier.sessionsCount,
        })

        this.logger.log(`Created subscription with pricingTier ${pricingTierId} for enrollment ${enrollmentId}`)
        return subscription
    }


    async findAll(userId: number, query: GetEnrollmentListQueryDto) {
        const { limit, page, dateFrom, dateTo, status, lessonId, childId, sortDirection } = query

        const queryBuilder = this.enrollmentRepository.createQueryBuilder("enrollments")

        queryBuilder.leftJoinAndSelect("enrollments.child", "children")
        queryBuilder.leftJoinAndSelect("enrollments.lesson", "lessons")
        queryBuilder.leftJoinAndSelect("enrollments.subscriptions", "subscriptions")

        queryBuilder.where("users.id = :userId", { userId })

        if (childId) {
            queryBuilder.andWhere("children.id = :childId", { childId })
        }

        if (lessonId) {
            queryBuilder.andWhere("lessons.id = :lessonId", { lessonId })
        }

        if (status) {
            queryBuilder.andWhere("enrollments.status = :status", { status })
        }

        if (dateFrom) {
            queryBuilder.andWhere("enrollments.enrolledAt >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("enrollments.enrolledAt <= :dateTo", { dateTo })
        }

        queryBuilder.orderBy("enrollments.enrolledAt", sortDirection)
        queryBuilder.skip((page - 1) * limit).take(limit)

        const [enrollments, totalCount] = await queryBuilder.getManyAndCount()
        const totalPagesAmount = Math.ceil(totalCount / limit)

        this.logger.debug("Get enrollment list: ", enrollments)
        return {
            data: enrollments,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: page,
            },
        }
    }


    async findById(userId: number, enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: {
                id: enrollmentId,
                child: {
                    user: { id: userId },
                },
            },
            relations: {
                child: true,
                lesson: true,
                subscriptions: {
                    attendances: true,
                    pricingTier: true,
                },
                application: true,
            },
            select: {
                id: true,
                status: true,
                enrolledAt: true,
                consentedAt: true,
                child: {
                    id: true,
                    firstName: true,
                    secondName: true,
                },
                lesson: {
                    id: true,
                    name: true,
                    description: true,
                },
                subscriptions: {
                    id: true,
                    paymentStatus: true,
                    paidAmount: true,
                    sessionsTotal: true,
                    sessionsLeft: true,
                    createdAt: true,
                    pricingTier: {
                        id: true,
                        label: true,
                        price: true,
                        sessionsCount: true,
                    },
                    attendances: {
                        id: true,
                        date: true,
                        isPresent: true,
                        note: true,
                    },
                },
            },
        })

        if (!enrollment) {
            this.logger.log(`No enrollment with id: ${enrollmentId}`)
            throw new NotFoundException(`Enrollment with id ${enrollmentId} not found`)
        }

        this.logger.log(`Finded enrollment with id: ${enrollmentId}`)
        return enrollment
    }


    async findAllSubscriptionByEnrollmentId(userId: number, enrollmentId: number) {
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


    async remove(userId: number, enrollmentId: number) {
        this.logger.log(`Deleting pending enrollment with id: ${enrollmentId}`)
        const deleteResult = await this.enrollmentRepository.delete({
            id: enrollmentId,
            user: { id: userId },
            status: EnrollmentStatus.PENDING,
        })

        if (deleteResult.affected === 0) {
            this.logger.log(`Cannot delete enrollment. No  pending enrollment with id: ${enrollmentId}`)
            throw new NotFoundException(`Pending enrollment with id ${enrollmentId} not found`)
        }

        return deleteResult
    }


    private async validateChildOwnership(childId: number, userId: number) {
        const exists = await this.childRepository.exists({
            where: {
                id: childId,
                user: { id: userId },
            },
        })
    
        if (!exists) {
            throw new NotFoundException("Child not found")
        }
    }


    private async getLessonWithSurveyOrThrow(lessonId: number) {
        const lesson = await this.lessonRepository.findOne({
            where: {
                id: lessonId,
                isActive: true,
            },
            relations: { survey: true },
        })
    
        if (!lesson) {
            throw new NotFoundException("Lesson not found")
        }

        return lesson
    }


    private async validateActiveEnrollmentExisting(lessonId: number, childId: number) {
        const isEnrollmentExists = await this.enrollmentRepository.exists({
            where: {
                child: { id: childId },
                lesson: { id: lessonId },
                status: Not(EnrollmentStatus.SUSPENDED),
            },
        })

        if (isEnrollmentExists) {
            throw new BadRequestException("Child is already enrolled in this lesson")
        }
    }


    private async getEnrollmentOrThrow(userId: number, enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: {
                id: enrollmentId,
                status: EnrollmentStatus.ACTIVE,
                user: { id: userId },
            },
            relations: {
                lesson: true,
            },
        })
    
        if (!enrollment) {
            throw new NotFoundException("Enrollment not found")
        }

        return enrollment
    }


    private async getPricingTierOrThrow(tierId: number, lessonId: number) {
        const tier = await this.pricingTierRepository.findOne({
            where: {
                id: tierId,
                lesson: { id: lessonId },
                isActive: true,
            },
        })
    
        if (!tier) {
            throw new NotFoundException("Pricing tier not found")
        }
    
        return tier
    }
}