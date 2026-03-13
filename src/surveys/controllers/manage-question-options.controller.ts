import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from "@nestjs/common"
import { ManageQuestionOptionsService } from "../services/manage-question-options.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { UpdateQuestionOptionBodyDto } from "../dto/update-question-option-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/question-options")
export class ManageQuestionOptionsController {
    constructor(private manageQuestionOptionsService: ManageQuestionOptionsService) {}

    @Get(":questionOptionId")
    async findById(@Param("questionOptionId", ParseIntPipe) questionOptionId: number) {
        const result = await this.manageQuestionOptionsService.findById(questionOptionId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        description: "Обновление варианта ответа вопроса",
    })
    @ApiParam({
        name: "questionOptionId",
        required: true,
        description: "ID варианта ответа",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления варианта ответа",
        required: true,
        type: UpdateQuestionOptionBodyDto,
    })
    @Patch(":questionOptionId")
    async update(
        @Param("questionOptionId", ParseIntPipe) questionOptionId: number,
        @Body() data: UpdateQuestionOptionBodyDto,
    ) {
        await this.manageQuestionOptionsService.update(questionOptionId, data)

        return {
            message: "Option updated successfully"
        }
    }


    @ApiBearerAuth()
    @ApiOperation({
        description: "Удаление варианта ответа вопроса",
    })
    @ApiParam({
        name: "questionOptionId",
        required: true,
        description: "ID варианта ответа",
        example: 1,
    })
    @Delete(":questionOptionId")
    async remove(@Param("questionOptionId", ParseIntPipe) questionOptionId: number) {
        await this.manageQuestionOptionsService.delete(questionOptionId)

        return {
            message: "Option deleted successfully"
        }
    }
}