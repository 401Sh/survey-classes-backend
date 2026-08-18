import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { AttendanceEntity } from "../entities/attendance.entity"
import { GetAttendanceListQueryDto, UpdateAttendanceBodyDto } from "../dto"

export interface IManageAttendancesService {
    findAll(query: GetAttendanceListQueryDto): Promise<PaginatedResult<AttendanceEntity>>
    update(attendanceId: number, data: UpdateAttendanceBodyDto): Promise<void>
    delete(attendanceId: number): Promise<void>
}