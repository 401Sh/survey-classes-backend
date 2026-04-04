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
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import {
    GLOBAL_THROTTLE_LIMIT,
    GLOBAL_THROTTLE_NAME,
    GLOBAL_THROTTLE_TTL,
} from "./common/constants/throttle.constant"
import { ApiKeyGuard } from "./common/guards/api-key.guard"

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
        ThrottlerModule.forRoot([
            {
                name: GLOBAL_THROTTLE_NAME,
                ttl: GLOBAL_THROTTLE_TTL,
                limit: GLOBAL_THROTTLE_LIMIT,
            },
        ]),
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
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_GUARD,
            useClass: ApiKeyGuard,
        },
    ],
})
export class AppModule {}