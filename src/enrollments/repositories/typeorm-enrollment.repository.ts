import { Injectable } from "@nestjs/common"
import {
    CreateEnrollmentData,
    EnrollmentListFilters,
    EnrollmentRepository,
    ManageEnrollmentListFilters,
} from "../abstracts/enrollment-repository.abstract"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { InjectRepository } from "@nestjs/typeorm"
import { Not, Repository } from "typeorm"

@Injectable()
export class TypeOrmEnrollmentRepository implements EnrollmentRepository {
    constructor(
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
    ) {}

    async create(data: CreateEnrollmentData): Promise<EnrollmentEntity> {
        const { userId, childId, lessonId, ...enrollmentData } = data

        const enrollment = await this.enrollmentRepository.save({
            ...enrollmentData,
            user: { id: userId },
            child: { id: childId },
            lesson: { id: lessonId },
        })

        return enrollment
    }


    async findById(id: number): Promise<EnrollmentEntity | null> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id },
        })

        return enrollment
    }


    async findByIdWithDetails(id: number): Promise<EnrollmentEntity | null> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id },
            relations: {
                subscriptions: true,
                lesson: true,
                child: true,
                user: true,
            },
        })

        return enrollment
    }


    async findByIdAndUserIdWithDetails(id: number, userId: number): Promise<EnrollmentEntity | null> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: {
                id,
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

        return enrollment
    }


    async findActiveByIdAndUserIdWithLesson(id: number, userId: number): Promise<EnrollmentEntity | null> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: {
                id,
                status: EnrollmentStatus.ACTIVE,
                user: { id: userId },
            },
            relations: {
                lesson: true,
            },
        })

        return enrollment
    }


    async findPageByUserId(
        userId: number,
        filters: EnrollmentListFilters,
    ): Promise<[EnrollmentEntity[], number]> {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            status,
            lessonId,
            childId,
            sortDirection,
        } = filters

        const queryBuilder = this.enrollmentRepository.createQueryBuilder("enrollments")

        queryBuilder.leftJoinAndSelect("enrollments.child", "children")
        queryBuilder.leftJoinAndSelect("enrollments.user", "users")
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

        return await queryBuilder.getManyAndCount()
    }


    async findPage(filters: ManageEnrollmentListFilters): Promise<[EnrollmentEntity[], number]> {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            status,
            lessonId,
            parentId,
            childId,
            sortDirection,
        } = filters

        const queryBuilder = this.enrollmentRepository.createQueryBuilder("enrollments")

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

        return await queryBuilder.getManyAndCount()
    }


    async existsNotSuspendedByLessonIdAndChildId(lessonId: number, childId: number): Promise<boolean> {
        const isEnrollmentExists = await this.enrollmentRepository.exists({
            where: {
                child: { id: childId },
                lesson: { id: lessonId },
                status: Not(EnrollmentStatus.SUSPENDED),
            },
        })

        return isEnrollmentExists
    }


    async updateStatus(id: number, status: EnrollmentStatus): Promise<boolean> {
        const updateResult = await this.enrollmentRepository.update(
            { id },
            { status },
        )

        return (updateResult.affected && updateResult.affected > 0) ? true : false
    }


    async deletePendingByIdAndUserId(id: number, userId: number): Promise<boolean> {
         const deleteResult = await this.enrollmentRepository.delete({
            id,
            user: { id: userId },
            status: EnrollmentStatus.PENDING,
        })

        return (deleteResult.affected && deleteResult.affected > 0) ? true : false
    }
}