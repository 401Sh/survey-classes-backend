import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Request } from "@nestjs/common"
import { EnrollmentsService } from "../services/enrollments.service"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiSecurity } from "@nestjs/swagger"
import { CreateEnrollmentBodyDto, CreateEnrollmentSubscriptionBodyDto, GetEnrollmentListQueryDto } from "../dto"

@Controller("enrollments/me")
export class EnrollmentsController {
    constructor(private enrollmentsService: EnrollmentsService) {}

    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Создание записи на занятие",
    })
    @ApiBody({
        description: "Данные для создания записи на занятие",
        required: true,
        type: CreateEnrollmentBodyDto,
    })
    @Post()
    async create(
        @Request() req,
        @Body() data: CreateEnrollmentBodyDto,
    ) {
        const userId = req.user.sub

        const result = await this.enrollmentsService.create(userId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Добавление тарифа оплаты к записи на занятие",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи на занятие",
        example: 1,
    })
    @ApiBody({
        description: "Данные для добавления тарифа оплаты",
        required: true,
        type: CreateEnrollmentSubscriptionBodyDto,
    })
    @Post(":enrollmentId")
    async createSubscription(
        @Request() req,
        @Param("enrollmentId", ParseIntPipe) enrollmentId: number,
        @Body() data: CreateEnrollmentSubscriptionBodyDto,
    ) {
        const userId = req.user.sub

        const result = await this.enrollmentsService.createSubscription(userId, enrollmentId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получения всех созданных записей",
    })
    @Get()
    async findAll(
        @Request() req,
        @Query() query: GetEnrollmentListQueryDto,
    ) {
        const userId = req.user.sub

        const result = await this.enrollmentsService.findAll(userId, query)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получение записи на занятие по ID",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи на занятие",
        example: 1,
    })
    @Get(":enrollmentId")
    async findById(
        @Request() req,
        @Param("enrollmentId", ParseIntPipe) enrollmentId: number,
    ) {
        const userId = req.user.sub

        const result = await this.enrollmentsService.findById(userId, enrollmentId)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получения всех добавленных тарифов оплаты",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи на занятие",
        example: 1,
    })
    @Get(":enrollmentId/subscriptions")
    async findAllSubscriptionsByEnrollmentId(
        @Request() req,
        @Param("enrollmentId", ParseIntPipe) enrollmentId: number,
    ) {
        const userId = req.user.sub

        const result = await this.enrollmentsService.findAllSubscriptionsByEnrollmentId(userId, enrollmentId)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Отмена записи на занятие",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи на занятие",
        example: 1,
    })
    @Delete(":enrollmentId")
    async remove(
        @Param("enrollmentId", ParseIntPipe) enrollmentId: number,
        @Request() req,
    ) {
        const userId = req.user.sub

        await this.enrollmentsService.delete(userId, enrollmentId)

        return {
            message: "Enrollment deleted successfully",
        }
    }
}