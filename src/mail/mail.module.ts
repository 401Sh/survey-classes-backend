import { Module } from "@nestjs/common"
import { MailService } from "./mail.service"
import { MailTemplateRegistry } from "./mail-template.registry"

@Module({
    providers: [
        MailService,
        MailTemplateRegistry,
    ],
    exports: [MailService],
})
export class MailModule {}