import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request } from "@nestjs/common"
import { ApplicationsService } from "../services/applications.service"
import { CreateApplicationBodyDto } from "../dto/create-application-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"
import { UpdateApplicationBodyDto } from "../dto/update-application-body.dto"

@Controller("applications/me")
export class ApplicationsController {
    constructor(private applicationsService: ApplicationsService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание ответов на опрос для записи на занятие",
    })
    @ApiBody({
        description: "Данные для создания заявки",
        required: true,
        type: CreateApplicationBodyDto,
    })
    @Post()
    async create(
        @Request() req,
        @Body() data: CreateApplicationBodyDto,
    ) {
        const userId = req.user.sub

        const result = await this.applicationsService.create(userId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получения всех созданных ответов на опросы",
    })
    @Get()
    async findAll(@Request() req) {
        const userId = req.user.sub

        const result = await this.applicationsService.findAll(userId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение созданных ответов на опрос",
    })
    @ApiParam({
        name: "applicationId",
        required: true,
        description: "ID заявки",
        example: 1,
    })
    @Get(":applicationId")
    async findById(
        @Request() req,
        @Param("applicationId", ParseIntPipe) applicationId: number,
    ) {
        const userId = req.user.sub

        const result = await this.applicationsService.findById(userId, applicationId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Обновление данных ответов на опрос",
    })
    @ApiParam({
        name: "applicationId",
        required: true,
        description: "ID опроса",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления ответов",
        required: true,
        type: UpdateApplicationBodyDto,
    })
    @Patch(":applicationId")
    async update(
        @Request() req,
        @Param("applicationId", ParseIntPipe) applicationId: number,
        @Body() data: UpdateApplicationBodyDto,
    ) {
        const userId = req.user.sub

        await this.applicationsService.update(userId, applicationId, data)

        return {
            message: "Application updated successfully",
        }
    }
}