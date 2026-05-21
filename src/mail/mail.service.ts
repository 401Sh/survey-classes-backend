import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"
import { MAIL_FROM_NAME } from "src/common/constants/mail.constant"
import { IMailService } from "./interfaces/mail-service.interface"
import { MailTemplateRegistry } from "./mail-template.registry"
import { MAIL_TEMPLATES } from "./constants/mail-template.constant"
import { UserEntity } from "src/users/entities/user.entity"
import { MailTemplate } from "src/common/enums/mail-template.enum"

@Injectable()
export class MailService implements IMailService {
    private readonly logger = new Logger(MailService.name)

    private readonly mailer: nodemailer.Transporter

    constructor(
        private readonly configService: ConfigService,
        private readonly templateRegistry: MailTemplateRegistry,
    ) {

        // TODO: change constants to configService registerAs
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

    async sendMail(
        templateKey: MailTemplate,
        user: UserEntity,
        context: Record<string, unknown>,
    ): Promise<void> {
        const config = MAIL_TEMPLATES[templateKey]
        const html = this.templateRegistry.render(templateKey, {
            name: user.firstName,
            ...context,
        })
        await this.send(user.email, config.subject, html)
    }


    private async send(to: string, subject: string, html: string): Promise<void> {
        try {
            await this.mailer.sendMail({ to, subject, html })
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`)
            throw new InternalServerErrorException("Failed to send email")
        }
    }
}