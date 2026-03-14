import { ChildrenService } from "../services/children.service"
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request } from "@nestjs/common"
import { CreateChildBodyDto } from "../dto/create-child-body.dto"
import { UpdateChildBodyDto } from "../dto/update-child-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"

@Controller("users/me/children")
export class ChildrenController {
    constructor(private childrenService: ChildrenService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание ребенка пользователя",
    })
    @ApiBody({
        description: "Данные для создания ребенка",
        required: true,
        type: CreateChildBodyDto,
    })
    @Post()
    async create(
        @Body() data: CreateChildBodyDto,
        @Request() req,
    ) {
        const userId = req.user.sub

        const result = await this.childrenService.create(userId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех детей пользователя",
    })
    @Get()
    async findAll(@Request() req) {
        const userId = req.user.sub

        const result = await this.childrenService.findAll(userId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение данных ребенка пользователя",
    })
    @ApiParam({
        name: "childId",
        required: true,
        description: "ID ребенка",
        example: 1,
    })
    @Get(":childId")
    async findById(
        @Param("childId", ParseIntPipe) childId: number,
        @Request() req,
    ) {
        const userId = req.user.sub

        const result = await this.childrenService.findById(userId, childId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Обновление данных ребенка пользователя",
    })
    @ApiParam({
        name: "childId",
        required: true,
        description: "ID ребенка",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления ребенка",
        required: true,
        type: UpdateChildBodyDto,
    })
    @Patch(":childId")
    async update(
        @Param("childId", ParseIntPipe) childId: number,
        @Body() data: UpdateChildBodyDto,
        @Request() req,
    ) {
        const userId = req.user.sub

        await this.childrenService.update(userId, childId, data)

        return {
            message: "Child successfully updated",
        }
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Удаление ребенка пользователя",
    })
    @ApiParam({
        name: "childId",
        required: true,
        description: "ID ребенка",
        example: 1,
    })
    @Delete(":childId")
    async remove(
        @Param("childId", ParseIntPipe) childId: number,
        @Request() req,
    ) {
        const userId = req.user.sub

        await this.childrenService.delete(userId, childId)

        return {
            message: "Child deleted successfully",
        }
    }
}