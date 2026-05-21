import {
    MAIL_TEMPLATE_OTP_CONFIRM,
    MAIL_CONFIRMATION_SUBJECT,
    MAIL_TEMPLATE_PASSWORD_RESET,
    MAIL_RESET_PASSWORD_SUBJECT,
} from "src/common/constants/mail.constant"
import { IMailTemplate } from "../interfaces/mail-template.interface"
import { MailTemplate } from "src/common/enums/mail-template.enum"

export const MAIL_TEMPLATES: Record<string, IMailTemplate> = {
    [MailTemplate.Confirmation]: {
        templateName: MAIL_TEMPLATE_OTP_CONFIRM,
        subject: MAIL_CONFIRMATION_SUBJECT,
    },
    [MailTemplate.PasswordReset]: {
        templateName: MAIL_TEMPLATE_PASSWORD_RESET,
        subject: MAIL_RESET_PASSWORD_SUBJECT,
    },
}