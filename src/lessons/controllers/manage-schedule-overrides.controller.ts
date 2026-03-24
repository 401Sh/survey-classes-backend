import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from "@nestjs/common"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { ManageScheduleOverridesService } from "../services/manage-schedule-overrides.service"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"
import { UpdateScheduleOverrideBodyDto } from "../dto/update-schedule-override-body.dto"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/schedule-overrides")
export class ManageScheduleOverridesController {
    constructor(private manageScheduleOverridesService: ManageScheduleOverridesService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение изменения даты занятия по ID",
    })
    @ApiParam({
        name: "overrideId",
        required: true,
        description: "ID изменения",
        example: 1,
    })
    @Get(":overrideId")
    async findById(@Param("overrideId", ParseIntPipe) overrideId: number) {
        const result = await this.manageScheduleOverridesService.findById(overrideId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Обновление изменения даты занятия",
    })
    @ApiParam({
        name: "overrideId",
        required: true,
        description: "ID изменения",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления занятия",
        required: true,
        type: UpdateScheduleOverrideBodyDto,
    })
    @Patch(":overrideId")
    async update(
        @Param("overrideId", ParseIntPipe) overrideId: number,
        @Body() data: UpdateScheduleOverrideBodyDto,
    ) {
        await this.manageScheduleOverridesService.update(overrideId, data)

        return {
            message: "Schedule override updated successfully",
        }
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Удаление изменения даты занятия",
    })
    @ApiParam({
        name: "overrideId",
        required: true,
        description: "ID изменения",
        example: 1,
    })
    @Delete(":overrideId")
    async remove(@Param("overrideId", ParseIntPipe) overrideId: number) {
        await this.manageScheduleOverridesService.delete(overrideId)

        return {
            message: "Schedule override deleted successfully"
        }
    }
}