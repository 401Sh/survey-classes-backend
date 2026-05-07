import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { SubscriptionEntity } from "src/subscriptions/entities/subscription.entity"
import { CreateEnrollmentBodyDto } from "../dto/create-enrollment-body.dto"
import { CreateEnrollmentSubscriptionBodyDto } from "../dto/create-enrollment-subscription-body.dto"
import { GetEnrollmentListQueryDto } from "../dto/get-enrollment-list-query.dto"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { CreateEnrollmentResult } from "./create-enrollment-result.interface"

export interface IEnrollmentsService {
    create(userId: number, data: CreateEnrollmentBodyDto): Promise<CreateEnrollmentResult>
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