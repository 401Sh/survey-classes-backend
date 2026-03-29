import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Request } from "@nestjs/common"
import { EnrollmentsService } from "../services/enrollments.service"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"
import { GetEnrollmentListQueryDto } from "../dto/get-enrollment-list-query.dto"
import { CreateEnrollmentBodyDto } from "../dto/create-enrollment-body.dto"
import { CreateSubscriptionBodyDto } from "../dto/create-subscription-body.dto"

@Controller("enrollments/me")
export class EnrollmentsController {
    constructor(private enrollmentsService: EnrollmentsService) {}

    @ApiBearerAuth()
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
        type: CreateSubscriptionBodyDto,
    })
    @Post(":enrollmentId")
    async createSubscription(
        @Request() req,
        @Param("enrollmentId", ParseIntPipe) enrollmentId: number,
        @Body() data: CreateSubscriptionBodyDto,
    ) {
        const userId = req.user.sub

        const result = await this.enrollmentsService.createSubscription(userId, enrollmentId, data)

        return result
    }


    @ApiBearerAuth()
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
    @ApiOperation({
        summary: "Получения всех добавленных тарифов оплаты",
    })
    @ApiParam({
        name: "enrollmentId",
        required: true,
        description: "ID записи на занятие",
        example: 1,
    })
    @Get(":enrollmentId")
    async findAllSubscriptionByEnrollmentId(
        @Request() req,
        @Param("enrollmentId", ParseIntPipe) enrollmentId: number,
    ) {
        const userId = req.user.sub

        const result = await this.enrollmentsService.findAllSubscriptionByEnrollmentId(userId, enrollmentId)

        return result
    }


    @ApiBearerAuth()
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

        await this.enrollmentsService.remove(userId, enrollmentId)

        return {
            message: "Enrollment deleted successfully",
        }
    }
}