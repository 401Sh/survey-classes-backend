import { Controller, Get, Param, ParseIntPipe, Patch, Query } from "@nestjs/common"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { ManageApplicationsService } from "../services/manage-applications.service"
import { GetApplicationListQueryDto } from "../dto/get-application-list-query.dto"
import { ApiBearerAuth, ApiOperation, ApiParam, ApiSecurity } from "@nestjs/swagger"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/applications")
export class ManageApplicationsController {
    constructor(private manageApplicationsService: ManageApplicationsService) {}

    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получение всех существующих ответов на опросы",
    })
    @Get()
    async findAll(@Query() query: GetApplicationListQueryDto) {
        const result = await this.manageApplicationsService.findAll(query)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получение ответа на опрос по ID",
    })
    @ApiParam({
        name: "applicationId",
        required: true,
        description: "ID ответа",
        example: 1,
    })
    @Get(":applicationId")
    async findById(@Param("applicationId", ParseIntPipe) applicationId: number) {
        const result = await this.manageApplicationsService.findById(applicationId)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Одобрение ответа на опрос и записи на занятие",
    })
    @ApiParam({
        name: "applicationId",
        required: true,
        description: "ID ответа",
        example: 1,
    })
    @Patch(":applicationId/approve")
    async approve(@Param("applicationId", ParseIntPipe) applicationId: number) {
        await this.manageApplicationsService.approve(applicationId)

        return {
            message: "Application approved successfully - enrollment created",
        }
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Отклонение ответа на опрос",
    })
    @ApiParam({
        name: "applicationId",
        required: true,
        description: "ID ответа",
        example: 1,
    })
    @Patch(":applicationId/reject")
    async reject(@Param("applicationId", ParseIntPipe) applicationId: number) {
        await this.manageApplicationsService.reject(applicationId)

        return {
            message: "Application rejected successfully",
        }
    }
}