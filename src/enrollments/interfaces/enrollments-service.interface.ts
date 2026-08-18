import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { SubscriptionEntity } from "src/subscriptions/entities/subscription.entity"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { CreateEnrollmentBodyDto, CreateEnrollmentSubscriptionBodyDto, GetEnrollmentListQueryDto } from "../dto"

export interface IEnrollmentsService {
    create(userId: number, data: CreateEnrollmentBodyDto): Promise<EnrollmentEntity>
    createSubscription(
        userId: number,
        enrollmentId: number,
        data: CreateEnrollmentSubscriptionBodyDto,
    ): Promise<SubscriptionEntity>
    findAll(userId: number, query: GetEnrollmentListQueryDto): Promise<PaginatedResult<EnrollmentEntity>>
    findById(userId: number, enrollmentId: number): Promise<EnrollmentEntity>
    findAllSubscriptionsByEnrollmentId(userId: number, enrollmentId: number): Promise<SubscriptionEntity[]>
    delete(userId: number, enrollmentId: number): Promise<void>
}