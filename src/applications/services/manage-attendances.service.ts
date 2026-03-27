import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { AttendanceEntity } from "../entities/attendance.entity"
import { Repository } from "typeorm"
import { UpdateAttendanceBodyDto } from "../dto/update-attendance-body.dto"
import { GetAttendanceBodyDto } from "../dto/get-attendance-body.dto"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"

@Injectable()
export class ManageAttendancesService {
    private readonly logger = new Logger(ManageAttendancesService.name)

    constructor(
        @InjectRepository(AttendanceEntity)
        private attendanceRepository: Repository<AttendanceEntity>,
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
    ) {}

    async findAll(query: GetAttendanceBodyDto) {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            isPresent,
            lessonId,
            userId,
            childId,
            sortDirection,
        } = query

        const queryBuilder = this.attendanceRepository.createQueryBuilder("attendances")

        queryBuilder.leftJoinAndSelect("attendances.enrollment", "enrollments")
        queryBuilder.leftJoinAndSelect("enrollments.child", "children")
        queryBuilder.leftJoinAndSelect("children.user", "users")
        queryBuilder.leftJoinAndSelect("enrollments.lesson", "lessons")
        
        if (isPresent !== undefined) {
            queryBuilder.andWhere("attendances.isPresent = :isPresent", { isPresent })
        }

        if (lessonId) {
            queryBuilder.andWhere("lessons.id = :lessonId", { lessonId })
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

        const attendance = await this.enrollmentRepository.manager.transaction(async (manager) => {
            const attendance = await manager.findOne(AttendanceEntity,
                {
                    where: { id: attendanceId },
                    relations: { enrollment: true },
                }
            )

            if (!attendance) throw new NotFoundException("Attendance not found")

            await manager.update(AttendanceEntity,
                { id: attendanceId },
                data,
            )

            // change sessionsLeft
            if (isPresent !== undefined && isPresent !== attendance.isPresent) {
                const enrollment = attendance.enrollment

                const delta = isPresent ? -1 : +1
                const newSessionsLeft = enrollment.sessionsLeft + delta
                // if sessionsLeft is equal to zero - change status to FINISHED
                const newStatus = newSessionsLeft <= 0 ? EnrollmentStatus.FINISHED : EnrollmentStatus.ACTIVE

                await manager.update(EnrollmentEntity,
                    { id: enrollment.id },
                    {
                        sessionsLeft: newSessionsLeft,
                        status: newStatus,
                    }
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
                relations: { enrollment: true },
            })

            if (!attendance) throw new NotFoundException(`Attendance with id ${attendanceId} not found`)

            // return session if it was used
            if (attendance.isPresent) {
                const enrollment = attendance.enrollment

                const newSessionsLeft = enrollment.sessionsLeft + 1
                const newStatus = newSessionsLeft > 0 ? EnrollmentStatus.ACTIVE : enrollment.status
    
                await manager.update(EnrollmentEntity,
                    { id: attendance.enrollment.id },
                    {
                        sessionsLeft: newSessionsLeft,
                        status: newStatus,
                    }
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