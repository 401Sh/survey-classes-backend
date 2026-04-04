import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from "@nestjs/common"
import { ManageEnrollmentsService } from "../services/manage-enrollments.service"
import { GetManageEnrollmentListQueryDto } from "../dto/get-manage-enrollment-list-query.dto"
import { ApiBearerAuth, ApiOperation, ApiParam, ApiSecurity } from "@nestjs/swagger"

@Controller("manage/enrollments")
export class ManageEnrollmentsController {
    constructor(private manageEnrollmentsService: ManageEnrollmentsService) {}

    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получение всех существующих записей на занятия",
    })
    @Get()
    async findAll(@Query() query: GetManageEnrollmentListQueryDto) {
        const result = await this.manageEnrollmentsService.findAll(query)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получение записи на занятие",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи",
        example: 1,
    })
    @Get(":enrollmentId")
    async findById(@Param("enrollmentId", ParseIntPipe) enrollmentId: number) {
        const result = await this.manageEnrollmentsService.findById(enrollmentId)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Принятие записи на занятие",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи",
        example: 1,
    })
    @Patch(":enrollmentId/activate")
    async activate(@Param("enrollmentId", ParseIntPipe) enrollmentId: number) {
        await this.manageEnrollmentsService.activate(enrollmentId)

        return {
            message: "Enrollment activated successfully",
        }
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Приостановление записи на занятие",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи",
        example: 1,
    })
    @Patch(":enrollmentId/suspend")
    async suspend(@Param("enrollmentId", ParseIntPipe) enrollmentId: number) {
        await this.manageEnrollmentsService.suspend(enrollmentId)

        return {
            message: "Enrollment suspended successfully",
        }
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Возобновление записи на занятие",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи",
        example: 1,
    })
    @Patch(":enrollmentId/unsuspend")
    async unsuspend(@Param("enrollmentId", ParseIntPipe) enrollmentId: number) {
        await this.manageEnrollmentsService.unsuspend(enrollmentId)

        return {
            message: "Enrollment unsuspended successfully",
        }
    }
}