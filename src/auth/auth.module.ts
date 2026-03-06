import { Module } from "@nestjs/common"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { UsersService } from "src/users/users.service"
import { MailService } from "src/mail/mail.service"
import { TokensService } from "./services/tokens.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EmailVerificationEntity } from "./entities/email-verification.entity"
import { RefreshSessionEntity } from "./entities/refresh-session.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            RefreshSessionEntity,
            EmailVerificationEntity,
        ]),
        UsersService,
        MailService,
    ],
    controllers: [AuthController],
    providers: [
        TokensService,
        AuthService,
    ],
})
export class AuthModule {}