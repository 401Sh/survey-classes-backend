import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { GetManageEnrollmentListQueryDto } from "../dto"

export interface IManageEnrollmentsService {
    findAll(query: GetManageEnrollmentListQueryDto): Promise<PaginatedResult<EnrollmentEntity>>
    findById(id: number): Promise<EnrollmentEntity>
    activate(enrollmentId: number): Promise<void>
    suspend(enrollmentId: number): Promise<void>
    unsuspend(enrollmentId: number): Promise<void>
}