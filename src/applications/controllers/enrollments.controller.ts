import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Request } from "@nestjs/common"
import { EnrollmentsService } from "../services/enrollments.service"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"
import { GetEnrollmentListQueryDto } from "../dto/get-enrollment-list-query.dto"
import { CreateEnrollmentBodyDto } from "../dto/create-enrollment-body.dto"

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
        @Body() data: CreateEnrollmentBodyDto,
        @Request() req,
    ) {
        const userId = req.user.sub

        const result = await this.enrollmentsService.create(userId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получения всех созданных записей",
    })
    @Get()
    async findAll(
        @Query() query: GetEnrollmentListQueryDto,
        @Request() req,
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
}