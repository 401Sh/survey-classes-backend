import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { AttendanceEntity } from "../entities/attendance.entity"
import { Repository } from "typeorm"
import { UpdateAttendanceBodyDto } from "../dto/update-attendance-body.dto"
import { GetAttendanceBodyDto } from "../dto/get-attendance-body.dto"
import { SubscriptionEntity } from "../entities/subscription.entity"

@Injectable()
export class ManageAttendancesService {
    private readonly logger = new Logger(ManageAttendancesService.name)

    constructor(
        @InjectRepository(AttendanceEntity)
        private attendanceRepository: Repository<AttendanceEntity>,
    ) {}

    async findAll(query: GetAttendanceBodyDto) {
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
        } = query

        const queryBuilder = this.attendanceRepository.createQueryBuilder("attendances")

        queryBuilder.leftJoinAndSelect("attendances.subscription", "subscriptions")
        queryBuilder.leftJoinAndSelect("subscriptions.enrollment", "enrollments")
        queryBuilder.leftJoinAndSelect("enrollments.child", "children")
        queryBuilder.leftJoinAndSelect("enrollments.user", "users")
        queryBuilder.leftJoinAndSelect("enrollments.lesson", "lessons")
        
        if (isPresent !== undefined) {
            queryBuilder.andWhere("attendances.isPresent = :isPresent", { isPresent })
        }

        if (lessonId) {
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

        const [attendances, totalCount] = await queryBuilder.getManyAndCount()
        const totalPagesAmount = Math.ceil(totalCount / limit)

        this.logger.debug("Get attendance list: ", attendances)
        return {
            data: attendances,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: page,
            },
        }
    }


    async update(attendanceId: number, data: UpdateAttendanceBodyDto) {
        const { isPresent } = data

        const attendance = await this.attendanceRepository.manager.transaction(async (manager) => {
            const attendance = await manager.findOne(AttendanceEntity,
                {
                    where: { id: attendanceId },
                    relations: { subscription: true },
                }
            )

            if (!attendance) throw new NotFoundException("Attendance not found")

            await manager.update(AttendanceEntity,
                { id: attendanceId },
                data,
            )

            // change sessionsLeft
            if (isPresent !== undefined && isPresent !== attendance.isPresent) {
                const subscription = attendance.subscription

                const delta = isPresent ? -1 : +1
                const newSessionsLeft = subscription.sessionsLeft + delta

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

        this.logger.log(`Attendance with id ${attendanceId} updated successfully`)
        return attendance
    }


    async delete(attendanceId: number) {
        this.logger.log(`Deleting attendance with id: ${attendanceId}`)

        await this.attendanceRepository.manager.transaction(async (manager) => {
            const attendance = await manager.findOne(AttendanceEntity, {
                where: { id: attendanceId },
                relations: { subscription: true },
            })

            if (!attendance) throw new NotFoundException(`Attendance with id ${attendanceId} not found`)

            // return session number if it was used before
            if (attendance.isPresent) {
                const subscription = attendance.subscription
                const newSessionsLeft = subscription.sessionsLeft + 1
    
                await manager.update(SubscriptionEntity,
                    { id: subscription.id },
                    {
                        sessionsLeft: newSessionsLeft,
                        isActive: true,
                    },
                )
            }

            const deleteResult = await manager.delete(AttendanceEntity, { id: attendanceId })

            if (deleteResult.affected === 0) {
                this.logger.log(`Cannot delete attendance. No attendance with id: ${attendanceId}`)
                throw new NotFoundException(`Attendance with id ${attendanceId} not found`)
            }

            return deleteResult
        })
    }
}