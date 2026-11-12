import { Injectable } from "@nestjs/common"
import {
    AttendanceData,
    AttendanceListFilters,
    AttendanceRepository,
    SubscriptionSessions,
} from "../abstracts/attendance-repository.abstract"
import { AttendanceEntity } from "../entities/attendance.entity"
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { SubscriptionEntity } from "../entities/subscription.entity"

@Injectable()
export class TypeOrmAttendanceRepository implements AttendanceRepository {
    constructor(
        @InjectRepository(AttendanceEntity)
        private attendanceRepository: Repository<AttendanceEntity>,
    ) {}

    async createWithSessions(
        subscriptionId: number,
        data: AttendanceData,
        sessions?: SubscriptionSessions,
    ): Promise<AttendanceEntity> {
        const attendance = await this.attendanceRepository.manager.transaction(async (manager) => {
            const savedAttendance = await manager.save(AttendanceEntity, {
                ...data,
                subscription: { id: subscriptionId },
            })

            if (sessions) {
                await manager.update(SubscriptionEntity,
                    { id: subscriptionId },
                    { ...sessions },
                )
            }

            return savedAttendance
        })

        return attendance
    }


    async findByIdWithSubscription(id: number): Promise<AttendanceEntity | null> {
        const attendance = await this.attendanceRepository.findOne({
            where: { id },
            relations: { subscription: true },
        })

        return attendance
    }


    async findPage(filters: AttendanceListFilters): Promise<[AttendanceEntity[], number]> {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            isPresent,
            subscriptionId,
            lessonId,
            userId,
            childId,
            sortDirection,
        } = filters

        const queryBuilder = this.attendanceRepository.createQueryBuilder("attendances")

        queryBuilder.leftJoinAndSelect("attendances.subscription", "subscriptions")
        queryBuilder.leftJoinAndSelect("subscriptions.enrollment", "enrollments")
        queryBuilder.leftJoinAndSelect("enrollments.child", "children")
        queryBuilder.leftJoinAndSelect("enrollments.user", "users")
        
        if (isPresent !== undefined) {
            queryBuilder.andWhere("attendances.isPresent = :isPresent", { isPresent })
        }

        if (lessonId) {
            queryBuilder.leftJoin("enrollments.lesson", "lessons")
            queryBuilder.andWhere("lessons.id = :lessonId", { lessonId })
        }

        if (subscriptionId) {
            queryBuilder.andWhere("subscriptions.id = :subscriptionId", { subscriptionId })
        }

        if (userId) {
            queryBuilder.andWhere("users.id = :userId", { userId })
        }

        if (childId) {
            queryBuilder.andWhere("children.id = :childId", { childId })
        }

        if (dateFrom) {
            queryBuilder.andWhere("attendances.date >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("attendances.date <= :dateTo", { dateTo })
        }

        queryBuilder.orderBy("attendances.date", sortDirection)
        queryBuilder.skip((page - 1) * limit).take(limit)

        return await queryBuilder.getManyAndCount()
    }


    async updateWithSessions(
        id: number,
        data: Partial<AttendanceData>,
        subscriptionId: number,
        sessions?: SubscriptionSessions,
    ): Promise<boolean> {
        const isUpdated = await this.attendanceRepository.manager.transaction(async (manager) => {
            const updateResult = await manager.update(AttendanceEntity,
                { id },
                { ...data },
            )

            if (!updateResult.affected) return false

            if (sessions) {
                await manager.update(SubscriptionEntity,
                    { id: subscriptionId },
                    { ...sessions },
                )
            }

            return true
        })

        return isUpdated
    }


    async deleteWithSessions(
        id: number,
        subscriptionId: number,
        sessions?: SubscriptionSessions,
    ): Promise<boolean> {
        const isDeleted = await this.attendanceRepository.manager.transaction(async (manager) => {
            const deleteResult = await manager.delete(AttendanceEntity, { id })

            if (!deleteResult.affected) return false

            if (sessions) {
                await manager.update(SubscriptionEntity,
                    { id: subscriptionId },
                    { ...sessions },
                )
            }

            return true
        })

        return isDeleted
    }
}