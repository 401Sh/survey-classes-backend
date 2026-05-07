import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { CreateAttendanceBodyDto } from "../dto/create-attendance-body.dto"
import { GetManageSubscriptionListQueryDto } from "../dto/get-manage-subscription-list-query.dto"
import { PayFullPriceSubscriptionPaymentBodyDto } from "../dto/pay-full-price-subscription-payment-body.dto"
import { RefundSubscriptionPaymentBodyDto } from "../dto/refund-subscription-payment-body.dto"
import { AttendanceEntity } from "../entities/attendance.entity"
import { SubscriptionEntity } from "../entities/subscription.entity"

export interface IManageSubscriptionsService {
    createAttendance(subscriptionId: number, data: CreateAttendanceBodyDto): Promise<AttendanceEntity>
    findAll(query: GetManageSubscriptionListQueryDto): Promise<PaginatedResult<SubscriptionEntity>>
    findById(id: number): Promise<SubscriptionEntity>
    payFullPrice(subscriptionId: number, data: PayFullPriceSubscriptionPaymentBodyDto): Promise<void>
    refund(subscriptionId: number, data: RefundSubscriptionPaymentBodyDto): Promise<void>
}