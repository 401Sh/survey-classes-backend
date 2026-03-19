import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { LessonsModule } from "./lessons/lessons.module"
import { SurveysModule } from "./surveys/surveys.module"
import { ApplicationsModule } from "./applications/applications.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { dataSourceOptions } from "./common/configs/typeorm.config"
import { MailModule } from "./mail/mail.module"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { AccessTokenGuard } from "./common/guards/access-token.guard"
import { RolesGuard } from "./common/guards/role.guard"
import { DictionariesModule } from "./dictionaries/dictionaries.module"

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(dataSourceOptions),
        AuthModule,
        UsersModule,
        LessonsModule,
        SurveysModule,
        ApplicationsModule,
        MailModule,
        DictionariesModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: AccessTokenGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule {}