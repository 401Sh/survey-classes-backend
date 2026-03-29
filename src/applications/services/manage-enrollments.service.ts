import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { Repository } from "typeorm"
import { GetManageEnrollmentListQueryDto } from "../dto/get-manage-enrollment-list-query.dto"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { ApplicationStatus } from "../enums/application-status.enum"

@Injectable()
export class ManageEnrollmentsService {
    private readonly logger = new Logger(ManageEnrollmentsService.name)

    constructor(
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
    ) {}

    async findAll(query: GetManageEnrollmentListQueryDto) {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            status,
            lessonId,
            parentId,
            childId,
            sortDirection
        } = query

        const queryBuilder = this.enrollmentRepository.createQueryBuilder("enrollments")

        queryBuilder.leftJoinAndSelect("enrollments.application", "applications")
        queryBuilder.leftJoinAndSelect("enrollments.lesson", "lessons")
        queryBuilder.leftJoinAndSelect("enrollments.user", "users")
        queryBuilder.leftJoinAndSelect("enrollments.child", "children")

        if (status) {
            queryBuilder.where("enrollments.status = :status", { status })
        }

        if (dateFrom) {
            queryBuilder.andWhere("enrollments.createdAt >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("enrollments.createdAt <= :dateTo", { dateTo })
        }

        if (lessonId) {
            queryBuilder.andWhere("lessons.id = :lessonId", { lessonId })
        }

        if (parentId) {
            queryBuilder.andWhere("users.id = :parentId", { parentId })
        }

        if (childId) {
            queryBuilder.andWhere("children.id = :childId", { childId })
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


    async findById(id: number) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id },
            relations: {
                subscriptions: true,
                application: true,
                lesson: true,
                child: true,
                user: true,
            },
        })

        if (!enrollment) {
            this.logger.log(`No enrollment with id: ${id}`)
            throw new NotFoundException(`Enrollment with id ${id} not found`)
        }

        this.logger.log(`Finded enrollment with id: ${id}`)
        this.logger.debug("Get enrollment: ", enrollment)
        return enrollment
    }


    async activate(enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id: enrollmentId },
            relations: { application: true },
        })

        if (!enrollment) throw new NotFoundException("Enrollment not found")

        if (enrollment.status !== EnrollmentStatus.PENDING) {
            throw new BadRequestException("Only pending enrollments can be activated")
        }

        // if there is an application - it must be approved.
        if (enrollment.application && enrollment.application.status !== ApplicationStatus.APPROVED) {
            throw new BadRequestException("Application must be approved before activating enrollment")
        }

        const updateResult = await this.enrollmentRepository.update(
            { id: enrollmentId },
            { status: EnrollmentStatus.ACTIVE },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot activate enrollment with id: ${enrollmentId}`)
            throw new NotFoundException("Enrollment not found")
        }

        return updateResult
    }


    async suspend(enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id: enrollmentId },
        })

        if (!enrollment) throw new NotFoundException("Enrollment not found")

        if (enrollment.status !== EnrollmentStatus.ACTIVE) {
            throw new BadRequestException("Only active enrollments can be suspended")
        }

        const updateResult = await this.enrollmentRepository.update(
            { id: enrollmentId },
            { status: EnrollmentStatus.SUSPENDED },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot suspend enrollment with id: ${enrollmentId}`)
            throw new NotFoundException("Enrollment not found")
        }

        return updateResult
    }


    async unsuspend(enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id: enrollmentId },
        })

        if (!enrollment) throw new NotFoundException("Enrollment not found")

        if (enrollment.status !== EnrollmentStatus.SUSPENDED) {
            throw new BadRequestException("Only suspended enrollments can be re-activated")
        }

        const updateResult = await this.enrollmentRepository.update(
            { id: enrollmentId },
            { status: EnrollmentStatus.ACTIVE },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot re-activate enrollment with id: ${enrollmentId}`)
            throw new NotFoundException("Enrollment not found")
        }

        return updateResult
    }
}