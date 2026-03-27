import { Controller, Get, Param, ParseIntPipe, Patch, Query } from "@nestjs/common"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { ManageApplicationsService } from "../services/manage-applications.service"
import { GetApplicationListQueryDto } from "../dto/get-application-list-query.dto"
import { ApiBearerAuth, ApiOperation, ApiParam } from "@nestjs/swagger"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/applications")
export class ManageApplicationsController {
    constructor(private manageApplicationsService: ManageApplicationsService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех существующих заявок на занятия",
    })
    @Get()
    async findAll(@Query() query: GetApplicationListQueryDto) {
        const result = await this.manageApplicationsService.findAll(query)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение заявки на занятие со всеми ответами на вопросы",
    })
    @ApiParam({
        name: "applicationId",
        required: true,
        description: "ID заявки",
        example: 1,
    })
    @Get(":applicationId")
    async findById(@Param("applicationId", ParseIntPipe) applicationId: number) {
        const result = await this.manageApplicationsService.findById(applicationId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Подтверждение записи на занятие",
    })
    @ApiParam({
        name: "applicationId",
        required: true,
        description: "ID заявки",
        example: 1,
    })
    @Patch(":applicationId/approve")
    async approveApplication(@Param("applicationId", ParseIntPipe) applicationId: number) {
        await this.manageApplicationsService.approve(applicationId)

        return {
            message: "application approved successfully - enrollment created",
        }
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Отклонение заявки на занятие",
    })
    @ApiParam({
        name: "applicationId",
        required: true,
        description: "ID заявки",
        example: 1,
    })
    @Patch(":applicationId/reject")
    async rejectApplication(@Param("applicationId", ParseIntPipe) applicationId: number) {
        await this.manageApplicationsService.reject(applicationId)

        return {
            message: "application rejected successfully",
        }
    }
}