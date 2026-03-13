import { Module } from "@nestjs/common"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { TokensService } from "./services/tokens.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CodeVerificationEntity } from "./entities/code-verification.entity"
import { RefreshSessionEntity } from "./entities/refresh-session.entity"
import { UsersModule } from "src/users/users.module"
import { MailModule } from "src/mail/mail.module"
import { JwtModule } from "@nestjs/jwt"
import { AccessTokenStrategy } from "./strategies/access-token.strategy"
import { RefreshTokenStrategy } from "./strategies/refresh-token.strategy"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            RefreshSessionEntity,
            CodeVerificationEntity,
        ]),
        JwtModule.register({}),
        UsersModule,
        MailModule,
    ],
    controllers: [AuthController],
    providers: [
        TokensService,
        AuthService,
        AccessTokenStrategy,
        RefreshTokenStrategy,
    ],
})
export class AuthModule {}