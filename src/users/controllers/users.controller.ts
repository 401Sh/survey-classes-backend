import { Body, Controller, Get, Patch, Request } from "@nestjs/common"
import { UsersService } from "../services/users.service"
import { UpdateUserBodyDto } from "../dto/update-user-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger"

@Controller("users")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение данных профиля",
    })
    @Get("me")
    async findById(@Request() req) {
        const userId = req.user.sub

        const result = await this.usersService.findById(userId)

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
    @Patch("me")
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