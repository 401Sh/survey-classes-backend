import { Controller, Get, Param, ParseIntPipe, Patch, Query } from "@nestjs/common"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { ManageApplicationsService } from "../services/manage-applications.service"
import { GetApplicationListQueryDto } from "../dto/get-application-list-query.dto"
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger"
import { ApplicationStatus } from "../enums/application-status.enum"
import { SortDirection } from "src/common/enums/sort-direction.enum"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/applications")
export class ManageApplicationsController {
    constructor(private manageApplicationsService: ManageApplicationsService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех существующих заявок на занятия",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Количество заявок на странице",
        example: 10,
        default: 4,
    })
    @ApiQuery({
        name: "page",
        required: false,
        description: "Номер страницы",
        example: 2,
        default: 1,
    })
    @ApiQuery({
        name: "dateFrom",
        required: false,
        description: "Фильтрация заявок, созданных позднее указанной даты",
        example: "2020-12-30",
    })
    @ApiQuery({
        name: "dateTo",
        required: false,
        description: "Фильтрация заявок, созданных раньше указанной даты",
        example: "2020-12-31",
    })
    @ApiQuery({
        name: "status",
        required: false,
        description: "Статус рассмотрения заявки",
        example: ApplicationStatus.PENDING,
    })
    @ApiQuery({
        name: "lessonId",
        required: false,
        description: "ID занятия",
        example: 1,
    })
    @ApiQuery({
        name: "createdBy",
        required: false,
        description: "ID родителя",
        example: 2,
    })
    @ApiQuery({
        name: "createdFor",
        required: false,
        description: "ID ребенка",
        example: 3,
    })
    @ApiQuery({
        name: "sortDirection",
        required: false,
        description: "Направление сортировки. ASC - восходящая, DESC - нисходящая",
        example: SortDirection.DESC,
        default: SortDirection.ASC,
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