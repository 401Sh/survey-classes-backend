import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from "@nestjs/common"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { ManagePricingTiersService } from "../services/manage-pricing-tiers.service"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"
import { UpdatePricingTierBodyDto } from "../dto/update-pricing-tier-body.dto"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/pricing-tiers")
export class ManagePricingTiersController {
    constructor(private managePricingTiersService: ManagePricingTiersService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение тарифа оплаты по ID",
    })
    @ApiParam({
        name: "tierId",
        required: true,
        description: "ID тарифа",
        example: 1,
    })
    @Get(":tierId")
    async findById(@Param("tierId", ParseIntPipe) tierId: number) {
        const result = await this.managePricingTiersService.findById(tierId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Обновление тарифа оплаты",
    })
    @ApiParam({
        name: "tierId",
        required: true,
        description: "ID тарифа",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления занятия",
        required: true,
        type: UpdatePricingTierBodyDto,
    })
    @Patch(":tierId")
    async update(
        @Param("tierId", ParseIntPipe) tierId: number,
        @Body() data: UpdatePricingTierBodyDto,
    ) {
        await this.managePricingTiersService.update(tierId, data)

        return {
            message: "Pricing tier updated successfully",
        }
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Удаление тарифа оплаты",
    })
    @ApiParam({
        name: "tierId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @Delete(":tierId")
    async remove(@Param("tierId", ParseIntPipe) tierId: number) {
        await this.managePricingTiersService.delete(tierId)

        return {
            message: "Pricing tier deleted successfully"
        }
    }
}