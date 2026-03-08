import { Body, Controller, Delete, Param, ParseIntPipe, Patch } from "@nestjs/common"
import { ManageQuestionOptionsService } from "../services/manage-question-options.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { UpdateQuestionOptionBodyDto } from "../dto/update-question-option-body.dto"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/question-options")
export class ManageQuestionOptionsController {
    constructor(private manageQuestionOptionsService: ManageQuestionOptionsService) {}

    @Patch(":questionOptionId")
    async update(
        @Param("questionOptionId", ParseIntPipe) questionOptionId: number,
        @Body() data: UpdateQuestionOptionBodyDto,
    ) {
        const result = await this.manageQuestionOptionsService.update(questionOptionId, data)

        return result
    }


    @Delete(":questionOptionId")
    async delete(@Param("questionOptionId", ParseIntPipe) questionOptionId: number) {
        const result = await this.manageQuestionOptionsService.delete(questionOptionId)

        return result
    }
}