import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { AttendanceEntity } from "../entities/attendance.entity"
import { SubscriptionEntity } from "../entities/subscription.entity"
import {
    CreateAttendanceBodyDto,
    GetManageSubscriptionListQueryDto,
    PayFullPriceSubscriptionPaymentBodyDto,
    RefundSubscriptionPaymentBodyDto
} from "../dto"

export interface IManageSubscriptionsService {
    createAttendance(subscriptionId: number, data: CreateAttendanceBodyDto): Promise<AttendanceEntity>
    findAll(query: GetManageSubscriptionListQueryDto): Promise<PaginatedResult<SubscriptionEntity>>
    findById(id: number): Promise<SubscriptionEntity>
    payFullPrice(subscriptionId: number, data: PayFullPriceSubscriptionPaymentBodyDto): Promise<void>
    refund(subscriptionId: number, data: RefundSubscriptionPaymentBodyDto): Promise<void>
}