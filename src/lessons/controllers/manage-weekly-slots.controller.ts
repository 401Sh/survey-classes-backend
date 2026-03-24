import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from "@nestjs/common"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { ManageWeeklySlotsService } from "../services/manage-weekly-slots.service"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"
import { UpdateWeeklySlotBodyDto } from "../dto/update-weekly-slot-body.dto"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/weekly-slots")
export class ManageWeeklySlotsController {
    constructor(private manageWeeklySlotsService: ManageWeeklySlotsService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение дня недели занятия по ID",
    })
    @ApiParam({
        name: "slotId",
        required: true,
        description: "ID дня",
        example: 1,
    })
    @Get(":slotId")
    async findById(@Param("slotId", ParseIntPipe) slotId: number) {
        const result = await this.manageWeeklySlotsService.findById(slotId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Обновление дня недели занятия",
    })
    @ApiParam({
        name: "slotId",
        required: true,
        description: "ID дня",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления занятия",
        required: true,
        type: UpdateWeeklySlotBodyDto,
    })
    @Patch(":slotId")
    async update(
        @Param("slotId", ParseIntPipe) slotId: number,
        @Body() data: UpdateWeeklySlotBodyDto,
    ) {
        await this.manageWeeklySlotsService.update(slotId, data)

        return {
            message: "Weekly slot updated successfully",
        }
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Удаление дня недели занятия",
    })
    @ApiParam({
        name: "slotId",
        required: true,
        description: "ID дня",
        example: 1,
    })
    @Delete(":slotId")
    async remove(@Param("slotId", ParseIntPipe) slotId: number) {
        await this.manageWeeklySlotsService.delete(slotId)

        return {
            message: "Weekly slot deleted successfully"
        }
    }
}