import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common"
import { ManageSubscriptionsService } from "../services/manage-subscriptions.service"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiSecurity } from "@nestjs/swagger"
import {
    CreateAttendanceBodyDto,
    GetManageSubscriptionListQueryDto,
    PayFullPriceSubscriptionPaymentBodyDto,
    RefundSubscriptionPaymentBodyDto
} from "../dto"

@Controller("manage/subscriptions")
export class ManageSubscriptionsController {
    constructor(private manageSubscriptionsSerivice: ManageSubscriptionsService) {}

    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Создание посещения занятия",
    })
    @ApiParam({
        name: "subscriptionId",
        required: true,
        description: "ID выбора тарифа",
        example: 1,
    })
    @Post(":subscriptionId/attendances")
    async createAttendance(
        @Param("subscriptionId", ParseIntPipe) subscriptionId: number,
        @Body() data: CreateAttendanceBodyDto,
    ) {
        const result = await this.manageSubscriptionsSerivice.createAttendance(subscriptionId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получение всех выбранных пользователями тарифов оплаты",
    })
    @Get()
    async findAll(@Query() query: GetManageSubscriptionListQueryDto) {
        const result = await this.manageSubscriptionsSerivice.findAll(query)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получение выбранного пользователем тарифа оплаты",
    })
    @ApiParam({
        name: "subscriptionId",
        required: true,
        description: "ID выбора тарифа",
        example: 1,
    })
    @Get(":subscriptionId")
    async findById(@Param("subscriptionId", ParseIntPipe) subscriptionId: number) {
        const result = await this.manageSubscriptionsSerivice.findById(subscriptionId)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Зафиксировать полную оплату тарифа",
    })
    @ApiParam({
        name: "subscriptionId",
        required: true,
        description: "ID выбора тарифа",
        example: 1,
    })
    @ApiBody({
        description: "Данные для оплаты тарифа",
        required: true,
        type: PayFullPriceSubscriptionPaymentBodyDto,
    })
    @Patch(":subscriptionId/payment")
    async payFullPrice(
        @Param("subscriptionId", ParseIntPipe) subscriptionId: number,
        @Body() data: PayFullPriceSubscriptionPaymentBodyDto,
    ) {
        await this.manageSubscriptionsSerivice.payFullPrice(subscriptionId, data)

        return {
            message: "Subscription paid successfully",
        }
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Выполнить возврат оплаты тарифа",
    })
    @ApiParam({
        name: "subscriptionId",
        required: true,
        description: "ID выбора тарифа",
        example: 1,
    })
    @ApiBody({
        description: "Данные для возврата тарифа",
        required: true,
        type: RefundSubscriptionPaymentBodyDto,
    })
    @Patch(":subscriptionId/refund")
    async refund(
        @Param("subscriptionId", ParseIntPipe) subscriptionId: number,
        @Body() data: RefundSubscriptionPaymentBodyDto,
    ) {
        await this.manageSubscriptionsSerivice.refund(subscriptionId, data)

        return {
            message: "Subscription refunded successfully",
        }
    }
}