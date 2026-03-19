import { Body, Controller, Get, Patch, Request } from "@nestjs/common"
import { UsersService } from "../services/users.service"
import { UpdateUserBodyDto } from "../dto/update-user-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger"

@Controller("users/me")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение данных профиля",
    })
    @Get()
    async findById(@Request() req) {
        const userId = req.user.sub

        const result = await this.usersService.findById(userId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех записей на занятия",
    })
    @Get("enrollments")
    async findAll(@Request() req) {
        const userId = req.user.sub

        const result = await this.usersService.findAllUserEnrollments(userId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Обновление данных профиля",
    })
    @ApiBody({
        description: "Данные для обновления пользователя",
        required: true,
        type: UpdateUserBodyDto,
    })
    @Patch()
    async update(
        @Body() data: UpdateUserBodyDto,
        @Request() req,
    ) {
        const userId = req.user.sub

        await this.usersService.updateName(userId, data)

        return {
            message: "User successfully updated",
        }
    }
}