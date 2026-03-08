import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from "@nestjs/common"
import { ManageQuestionsService } from "../services/manage-questions.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { UpdateQuestionBodyDto } from "../dto/update-question-body.dto"
import { CreateQuestionOptionBodyDto } from "../dto/create-question-option-body.dto"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/questions")
export class ManageQuestionsController {
    constructor(private manageQuestionsService: ManageQuestionsService) {}

    @Patch(":questionId")
    async update(
        @Param("questionId", ParseIntPipe) questionId: number,
        @Body() data: UpdateQuestionBodyDto,
    ) {
        const result = await this.manageQuestionsService.update(questionId, data)

        return result
    }


    @Delete(":questionId")
    async delete(@Param("questionId", ParseIntPipe) questionId: number) {
        const result = await this.manageQuestionsService.delete(questionId)

        return result
    }

    
    @Post(":questionId/question-options")
    async createQuestionOption(
        @Param("questionId", ParseIntPipe) questionId: number,
        @Body() data: CreateQuestionOptionBodyDto,
    ) {
        const result = await this.manageQuestionsService.createQuestionOption(questionId, data)

        return result
    }
}