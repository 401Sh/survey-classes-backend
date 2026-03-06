import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"
import * as handlebars from "handlebars"
import { UserEntity } from "src/users/entities/user.entity"
import { join } from "path"
import { readFileSync } from "fs"
import { MAIL_CONFIRMATION_SUBJECT, MAIL_FROM_NAME, MAIL_TEMPLATES_PATH } from "src/common/constants/mail.constant"

@Injectable()
export class MailService {
    private readonly mailer: nodemailer.Transporter
    private readonly confirmationTemplate: handlebars.TemplateDelegate

    constructor(private readonly configService: ConfigService) {
        this.confirmationTemplate = this.loadTemplate("confirmation.hbs")

        this.mailer = nodemailer.createTransport(
            {
                host: this.configService.getOrThrow("MAIL_HOST"),
                port: this.configService.getOrThrow<number>("MAIL_PORT"),
                secure: this.configService.get<boolean>("MAIL_SECURE"),
                auth: {
                user: this.configService.getOrThrow("MAIL_USER"),
                pass: this.configService.getOrThrow("MAIL_PASSWORD"),
                },
            },
            {
                from: {
                name: MAIL_FROM_NAME,
                address: this.configService.getOrThrow("MAIL_FROM"),
                },
            },
        )
    }

    async sendUserConfirmation(user: UserEntity, code: string) {
        const html = this.confirmationTemplate({ name: user.firstName, code })

        await this.mailer.sendMail({
            to: user.email,
            subject: MAIL_CONFIRMATION_SUBJECT,
            html,
        })
    }


    private loadTemplate(name: string) {
        const tempFolder = join(__dirname, MAIL_TEMPLATES_PATH)
        const tempPath = join(tempFolder, name)

        const source = readFileSync(tempPath, "utf8")
        return handlebars.compile(source)
    }
}