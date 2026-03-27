import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common"
import { ManageEnrollmentsService } from "../services/manage-enrollments.service"
import { UpdateEnrollmentBodyDto } from "../dto/update-enrollment-body.dto"
import { GetEnrollmentListQueryDto } from "../dto/get-enrollment-list-query.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { UpdateEnrollmentPaymentBodyDto } from "../dto/update-enrollment-payment-body.dto"
import { CreateAttendanceBodyDto } from "../dto/create-attendance-body.dto"
import { GetEnrollmentAttendanceListQueryDto } from "../dto/get-enrollment-attendance-list-query.dto"

@Controller("manage/enrollments")
export class ManageEnrollmentsController {
    constructor(private manageEnrollmentsService: ManageEnrollmentsService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание посещения занятия",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи",
        example: 1,
    })
    @Post(":enrollmentId/attendances")
    async createAttendance(
        @Param("enrollmentId", ParseIntPipe) enrollmentId: number,
        @Body() data: CreateAttendanceBodyDto,
    ) {
        const result = await this.manageEnrollmentsService.createAttendance(enrollmentId, data)

        return result
    }

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех существующих записей на занятия",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Количество записей на странице",
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
        description: "Фильтрация записей, созданных позднее указанной даты",
        example: "2020-12-30",
    })
    @ApiQuery({
        name: "dateTo",
        required: false,
        description: "Фильтрация записей, созданных раньше указанной даты",
        example: "2020-12-31",
    })
    @ApiQuery({
        name: "status",
        required: false,
        description: "Статус записи на занятие",
        example: EnrollmentStatus.ACTIVE,
    })
    @ApiQuery({
        name: "lessonId",
        required: false,
        description: "ID занятия",
        example: 1,
    })
    @ApiQuery({
        name: "parentId",
        required: false,
        description: "ID родителя",
        example: 2,
    })
    @ApiQuery({
        name: "childId",
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
    async findAll(@Query() query: GetEnrollmentListQueryDto) {
        const result = await this.manageEnrollmentsService.findAll(query)

        return result
    }


    @ApiBearerAuth()
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
    @ApiOperation({
        summary: "Получение всех посещений занятий",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи",
        example: 1,
    })
    @Get(":enrollmentId/attendances")
    async findAllAttendancesByEnrollmentId(
        @Param("enrollmentId", ParseIntPipe) enrollmentId: number,
        @Query() query: GetEnrollmentAttendanceListQueryDto,
    ) {
        const result = await this.manageEnrollmentsService.findAllAttendancesByEnrollmentId(enrollmentId, query)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Обновление данных записи на занятие",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления записи",
        required: true,
        type: UpdateEnrollmentBodyDto,
    })
    @Patch(":enrollmentId")
    async update(
        @Param("enrollmentId", ParseIntPipe) enrollmentId: number,
        @Body() data: UpdateEnrollmentBodyDto,
    ) {
        await this.manageEnrollmentsService.update(enrollmentId, data)

        return {
            message: "enrollment updated successfully",
        }
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Фиксация оплаты записи на занятие",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления оплаты",
        required: true,
        type: UpdateEnrollmentPaymentBodyDto,
    })
    @Patch(":enrollmentId/payment")
    async payEnrollment(
        @Param("enrollmentId", ParseIntPipe) enrollmentId: number,
        @Body() data: UpdateEnrollmentPaymentBodyDto,
    ) {
        await this.manageEnrollmentsService.payEnrollment(enrollmentId, data)

        return {
            message: "enrollment payment applied successfully",
        }
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Отмена оплаты записи на занятие",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи",
        example: 1,
    })
    @Patch(":enrollmentId/payment/refund")
    async refundEnrollment(@Param("enrollmentId", ParseIntPipe) enrollmentId: number) {
        await this.manageEnrollmentsService.refundEnrollment(enrollmentId)

        return {
            message: "enrollment payment refunded successfully",
        }
    }
}