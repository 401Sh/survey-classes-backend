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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}