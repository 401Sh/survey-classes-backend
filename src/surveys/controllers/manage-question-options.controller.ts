import { Controller } from "@nestjs/common"
import { ManageQuestionOptionsService } from "../services/manage-question-options.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/question-options")
export class ManageQuestionOptionsController {
    constructor(private manageQuestionOptionsService: ManageQuestionOptionsService) {}
}