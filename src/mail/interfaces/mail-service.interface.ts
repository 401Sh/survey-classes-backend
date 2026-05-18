import { UserEntity } from "src/users/entities/user.entity"
import { MAIL_TEMPLATES } from "../constants/mail-template.constant"

export interface IMailService {
    sendMail(
        templateKey: keyof typeof MAIL_TEMPLATES,
        user: UserEntity,
        context: Record<string, unknown>
    ): Promise<void>
}