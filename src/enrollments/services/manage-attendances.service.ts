import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { AttendanceEntity } from "../entities/attendance.entity"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { IManageAttendancesService } from "../interfaces/manage-attendances-service.interface"
import { GetAttendanceListQueryDto, UpdateAttendanceBodyDto } from "../dto"
import { AttendanceRepository, SubscriptionSessions } from "../abstracts/attendance-repository.abstract"

@Injectable()
export class ManageAttendancesService implements IManageAttendancesService {
    private readonly logger = new Logger(ManageAttendancesService.name)

    constructor(private readonly attendanceRepository: AttendanceRepository) {}

    async findAll(query: GetAttendanceListQueryDto) {
        const [attendances, totalCount] = await this.attendanceRepository.findPage(query)
        const totalPagesAmount = Math.ceil(totalCount / query.limit)

        this.logger.debug("Get attendance list: ", attendances)
        return {
            data: attendances,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: query.page,
            },
        }
    }


    async update(attendanceId: number, data: UpdateAttendanceBodyDto) {
        const { isPresent } = data

        const attendance = await this.attendanceRepository.findByIdWithSubscription(attendanceId)

        if (!attendance) throw new NotFoundException("Attendance not found")

        const subscription = attendance.subscription

        // change sessionsLeft only if presence has changed
        let sessions: SubscriptionSessions | undefined

        if (isPresent !== undefined && isPresent !== attendance.isPresent) {
            const delta = isPresent ? -1 : +1
            const newSessionsLeft = subscription.sessionsLeft + delta

            // if sessionsLeft is equal to zero - change isActive status to false
            sessions = {
                sessionsLeft: newSessionsLeft,
                isActive: newSessionsLeft > 0,
            }
        }

        const isUpdated = await this.attendanceRepository.updateWithSessions(
            attendanceId,
            data,
            subscription.id,
            sessions,
        )

        if (!isUpdated) throw new NotFoundException("Attendance not found")

        this.logger.log(`Attendance with id ${attendanceId} updated successfully`)
    }


    async delete(attendanceId: number) {
        this.logger.log(`Deleting attendance with id: ${attendanceId}`)

        const attendance = await this.attendanceRepository.findByIdWithSubscription(attendanceId)

        if (!attendance) throw new NotFoundException(`Attendance with id ${attendanceId} not found`)

        const subscription = attendance.subscription

        // return session number if it was used before
        const sessions: SubscriptionSessions | undefined = attendance.isPresent
            ? { sessionsLeft: subscription.sessionsLeft + 1, isActive: true }
            : undefined

        const isDeleted = await this.attendanceRepository.deleteWithSessions(
            attendanceId,
            subscription.id,
            sessions,
        )

        if (!isDeleted) {
            this.logger.log(`Cannot delete attendance. No attendance with id: ${attendanceId}`)
            throw new NotFoundException(`Attendance with id ${attendanceId} not found`)
        }
    }
}