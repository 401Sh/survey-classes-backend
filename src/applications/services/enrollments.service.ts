import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { Repository } from "typeorm"
import { GetEnrollmentListQueryDto } from "../dto/get-enrollment-list-query.dto"
import { CreateEnrollmentBodyDto } from "../dto/create-enrollment-body.dto"
import { UserChildEntity } from "src/users/entities/user-child.entity"
import { ApplicationStatus } from "../enums/application-status.enum"
import { ApplicationEntity } from "../entities/application.entity"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { LessonPricingTierEntity } from "src/lessons/entities/lesson-pricing-tier.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"

@Injectable()
export class EnrollmentsService {
    private readonly logger = new Logger(EnrollmentsService.name)

    constructor(
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
        @InjectRepository(ApplicationEntity)
        private applicationRepository: Repository<ApplicationEntity>,
        @InjectRepository(LessonPricingTierEntity)
        private pricingTierRepository: Repository<LessonPricingTierEntity>,
        @InjectRepository(UserChildEntity)
        private childRepository: Repository<UserChildEntity>,
    ) {}

    async create(userId: number, data: CreateEnrollmentBodyDto) {
        const { lessonId, childId, pricingTierId } = data

        // check that the child belongs to the user
        await this.validateChildOwnership(childId, userId)

        // check and get approved application
        const application = await this.getApprovedApplicationOrThrow(childId, lessonId)

        // check and get pricingTier
        const pricingTier = await this.getValidPricingTierOrThrow(pricingTierId, lessonId)

        const enrollment = await this.enrollmentRepository.save({
            child: { id: childId },
            lesson: { id: lessonId },
            application: { id: application.id },
            pricingTier: { id: pricingTierId },
            sessionsTotal: pricingTier.sessionsCount,
            sessionsLeft: pricingTier.sessionsCount,
            enrolledAt: new Date(),
            status: EnrollmentStatus.ACTIVE,
        })

        this.logger.log(`Created child ${childId} enrollment for lesson ${lessonId}`)
        return enrollment
    }


    async findAll(userId: number, query: GetEnrollmentListQueryDto) {
        const { limit, page, dateFrom, dateTo, status, paymentStatus, lessonId, childId, sortDirection } = query

        const queryBuilder = this.enrollmentRepository.createQueryBuilder("enrollments")

        queryBuilder.leftJoinAndSelect("children.user", "users")
        queryBuilder.leftJoinAndSelect("enrollments.child", "children")

        queryBuilder.leftJoinAndSelect("enrollments.lesson", "lessons")
        queryBuilder.leftJoinAndSelect("enrollments.pricingTier", "pricingTiers")

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

        if (paymentStatus) {
            queryBuilder.andWhere("enrollments.paymentStatus = :paymentStatus", { paymentStatus })
        }

        if (dateFrom) {
            queryBuilder.andWhere("enrollments.enrolledAt >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("enrollments.enrolledAt <= :dateTo", { dateTo })
        }

        queryBuilder.orderBy("enrollments.createdAt", sortDirection)
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
                pricingTier: true,
                attendances: true,
            },
            select: {
                id: true,
                status: true,
                enrolledAt: true,
                sessionsTotal: true,
                sessionsLeft: true,
                paymentStatus: true,
                paidAmount: true,
                paidAt: true,
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
        })

        if (!enrollment) {
            this.logger.log(`No enrollment with id: ${enrollmentId}`)
            throw new NotFoundException(`Lesson with id ${enrollmentId} not found`)
        }

        this.logger.log(`Finded enrollment with id: ${enrollmentId}`)
        return enrollment
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


    private async getApprovedApplicationOrThrow(childId: number, lessonId: number) {
        const approved = await this.applicationRepository.findOne({
            where: {
                createdFor: { id: childId },
                lesson: { id: lessonId },
                status: ApplicationStatus.APPROVED,
            },
        })
    
        if (approved) return approved
    
        const lastApplication = await this.applicationRepository.findOne({
            where: {
                createdFor: { id: childId },
                lesson: { id: lessonId },
            },
            order: { createdAt: SortDirection.DESC },
        })
    
        if (!lastApplication) {
            throw new BadRequestException(
                "No application found — please submit an application with survey answers first"
            )
        }
    
        switch (lastApplication.status) {
            case ApplicationStatus.PENDING:
                throw new BadRequestException("Application is pending — wait for admin approval")
    
            case ApplicationStatus.BLOCKED:
                throw new BadRequestException("Enrollment is blocked by administrator — please contact support")
    
            default:
                throw new BadRequestException("Application was rejected or cancelled — please submit a new application")
        }
    }


    private async getValidPricingTierOrThrow(tierId: number, lessonId: number) {
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