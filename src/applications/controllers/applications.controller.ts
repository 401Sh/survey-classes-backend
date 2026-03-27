import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request } from "@nestjs/common"
import { ApplicationsService } from "../services/applications.service"
import { CreateApplicationBodyDto } from "../dto/create-application-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"

@Controller("applications/me")
export class ApplicationsController {
    constructor(private applicationsService: ApplicationsService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание заявки для записи на занятие",
    })
    @ApiBody({
        description: "Данные для создания заявки",
        required: true,
        type: CreateApplicationBodyDto,
    })
    @Post()
    async create(
        @Body() data: CreateApplicationBodyDto,
        @Request() req,
    ) {
        const userId = req.user.sub

        const result = await this.applicationsService.create(userId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получения всех созданных заявок",
    })
    @Get()
    async findAll(@Request() req) {
        const userId = req.user.sub

        const result = await this.applicationsService.findAll(userId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение созданной заявки",
    })
    @ApiParam({
        name: "applicationId",
        required: true,
        description: "ID заявки",
        example: 1,
    })
    @Get(":applicationId")
    async findById(
        @Param("applicationId", ParseIntPipe) applicationId: number,
        @Request() req,
    ) {
        const userId = req.user.sub

        const result = await this.applicationsService.findById(userId, applicationId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Отмена заявки на занятие",
    })
    @ApiParam({
        name: "applicationId",
        required: true,
        description: "ID заявки",
        example: 1,
    })
    @Patch(":applicationId/cancel")
    async cancelApplication(
        @Param("applicationId", ParseIntPipe) applicationId: number,
        @Request() req,
    ) {
        const userId = req.user.sub

        await this.applicationsService.cancel(userId, applicationId)

        return {
            message: "Application canceled successfully",
        }
    }
}