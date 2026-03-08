import { Controller } from "@nestjs/common"
import { ManageQuestionsService } from "../services/manage-questions.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/questions")
export class ManageQuestionsController {
    constructor(private manageQuestionsService: ManageQuestionsService) {}
}