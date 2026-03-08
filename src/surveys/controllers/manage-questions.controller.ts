import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from "@nestjs/common"
import { ManageQuestionsService } from "../services/manage-questions.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { UpdateQuestionBodyDto } from "../dto/update-question-body.dto"
import { CreateQuestionOptionBodyDto } from "../dto/create-question-option-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/questions")
export class ManageQuestionsController {
    constructor(private manageQuestionsService: ManageQuestionsService) {}

    @ApiBearerAuth()
    @ApiOperation({
        description: "Обновление вопроса",
    })
    @ApiParam({
        name: "questionId",
        required: true,
        description: "ID вопроса",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления вопроса",
        required: true,
        type: UpdateQuestionBodyDto,
    })
    @Patch(":questionId")
    async update(
        @Param("questionId", ParseIntPipe) questionId: number,
        @Body() data: UpdateQuestionBodyDto,
    ) {
        const result = await this.manageQuestionsService.update(questionId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        description: "Удаление вопроса у опроса",
    })
    @ApiParam({
        name: "questionId",
        required: true,
        description: "ID вопроса",
        example: 1,
    })
    @Delete(":questionId")
    async remove(@Param("questionId", ParseIntPipe) questionId: number) {
        const result = await this.manageQuestionsService.delete(questionId)

        return result
    }

    
    @ApiBearerAuth()
    @ApiOperation({
        description: "Создание варианта ответа для вопроса",
    })
    @ApiParam({
        name: "questionId",
        required: true,
        description: "ID вопроса",
        example: 1,
    })
    @ApiBody({
        description: "Данные для создания варианта ответа",
        required: true,
        type: CreateQuestionOptionBodyDto,
    })
    @Post(":questionId/question-options")
    async createQuestionOption(
        @Param("questionId", ParseIntPipe) questionId: number,
        @Body() data: CreateQuestionOptionBodyDto,
    ) {
        const result = await this.manageQuestionsService.createQuestionOption(questionId, data)

        return result
    }
}