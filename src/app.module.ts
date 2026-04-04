import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { LessonsModule } from "./lessons/lessons.module"
import { SurveysModule } from "./surveys/surveys.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { dataSourceOptions } from "./common/configs/typeorm.config"
import { MailModule } from "./mail/mail.module"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { AccessTokenGuard } from "./common/guards/access-token.guard"
import { RolesGuard } from "./common/guards/role.guard"
import { DictionariesModule } from "./dictionaries/dictionaries.module"
import { EnrollmentsModule } from "./enrollments/enrollments.module"
import { ApplicationsModule } from "./applications/applications.module"
import { SubscriptionsModule } from "./subscriptions/subscriptions.module"
import { MediaModule } from "./media/media.module"
import { ServeStaticModule } from "@nestjs/serve-static"
import { join } from "path"

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(dataSourceOptions),
        AuthModule,
        UsersModule,
        LessonsModule,
        SurveysModule,
        MailModule,
        DictionariesModule,
        EnrollmentsModule,
        ApplicationsModule,
        SubscriptionsModule,
        MediaModule,
        ServeStaticModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const mediaRoot = config.getOrThrow<string>('MEDIA_ROOT_PATH')
                return [{
                    rootPath: join(process.cwd(), mediaRoot),
                    serveRoot: '/' + mediaRoot,
                }]
            },
        }),
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