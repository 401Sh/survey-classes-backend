import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common"
import { ManageEnrollmentsService } from "../services/manage-enrollments.service"
import { UpdateEnrollmentBodyDto } from "../dto/update-enrollment-body.dto"
import { GetEnrollmentListQueryDto } from "../dto/get-enrollment-list-query.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"
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
        summary: "Получение всех посещений занятия для данной записи",
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
            message: "Enrollment updated successfully",
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
            message: "Enrollment payment applied successfully",
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
            message: "Enrollment payment refunded successfully",
        }
    }
}