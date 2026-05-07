import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { GetAttendanceListQueryDto } from "../dto/get-attendance-list-query.dto"
import { UpdateAttendanceBodyDto } from "../dto/update-attendance-body.dto"
import { AttendanceEntity } from "../entities/attendance.entity"

export interface IManageAttendancesService {
    findAll(query: GetAttendanceListQueryDto): Promise<PaginatedResult<AttendanceEntity>>
    update(attendanceId: number, data: UpdateAttendanceBodyDto): Promise<void>
    delete(attendanceId: number): Promise<void>
}