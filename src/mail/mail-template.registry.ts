import { Injectable, Logger } from "@nestjs/common"
import { MAIL_TEMPLATES_PATH } from "src/common/constants/mail.constant"
import { join } from "path"
import { readFileSync } from "fs"
import Handlebars from "handlebars"
import { MAIL_TEMPLATES } from "./constants/mail-template.constant"

@Injectable()
export class MailTemplateRegistry {
    private readonly logger = new Logger(MailTemplateRegistry.name)

    private readonly templates = new Map<string, Handlebars.TemplateDelegate>()

    onModuleInit() {
        Object.entries(MAIL_TEMPLATES).forEach(([key, { templateName }]) => {
            this.logger.log(`Template registered: ${key} -> ${templateName}`)
            this.register(key, templateName)
        })
    }

    register(key: string, templateName: string): void {
        const tempPath = join(__dirname, MAIL_TEMPLATES_PATH, templateName)
        const source = readFileSync(tempPath, "utf8")

        this.templates.set(key, Handlebars.compile(source))
    }


    render(key: string, context: Record<string, unknown>): string {
        const template = this.templates.get(key)

        if (!template) throw new Error(`Template "${key}" not found`)

        return template(context)
    }
}