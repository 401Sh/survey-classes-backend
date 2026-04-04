import { Body, Controller, Get, Patch, Request } from "@nestjs/common"
import { UsersService } from "../services/users.service"
import { UpdateUserBodyDto } from "../dto/update-user-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiSecurity } from "@nestjs/swagger"

@Controller("users/me")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @ApiBearerAuth()
    @ApiSecurity("api-key")
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
    @ApiSecurity("api-key")
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
        @Request() req,
        @Body() data: UpdateUserBodyDto,
    ) {
        const userId = req.user.sub

        await this.usersService.updateName(userId, data)

        return {
            message: "User successfully updated",
        }
    }
}