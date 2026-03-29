import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from "@nestjs/common"
import { ManageSubscriptionsService } from "../services/manage-subscriptions.service"
import { ApiBearerAuth, ApiOperation, ApiParam } from "@nestjs/swagger"
import { UpdateSubscriptionPaymentBodyDto } from "../dto/update-subscription-body.dto"
import { GetManageSubscriptionListQueryDto } from "../dto/get-manage-subscription-list-query.dto"

@Controller("manage/subscriptions")
export class ManageSubscriptionsController {
    constructor(private manageSubscriptionsSerivice: ManageSubscriptionsService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех выбранных пользователями тарифов оплаты",
    })
    @Get()
    async findAll(@Query() query: GetManageSubscriptionListQueryDto) {
        const result = await this.manageSubscriptionsSerivice.findAll(query)

        return result
    }


    @ApiBearerAuth()
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
    @ApiOperation({
        summary: "Полностью оплатить тариф",
    })
    @ApiParam({
        name: "subscriptionId",
        required: true,
        description: "ID выбора тарифа",
        example: 1,
    })
    @Patch(":subscriptionId/payment")
    async payFullPrice(
        @Param("subscriptionId", ParseIntPipe) subscriptionId: number,
        @Body() data: UpdateSubscriptionPaymentBodyDto,
    ) {
        await this.manageSubscriptionsSerivice.payFullPrice(subscriptionId, data)

        return {
            message: "Subscription paid successfully",
        }
    }
}