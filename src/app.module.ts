import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { LessonsModule } from "./lessons/lessons.module"
import { SurveysModule } from "./surveys/surveys.module"
import { ResponsesModule } from "./responses/responses.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { dataSourceOptions } from "./common/configs/typeorm.config"

@Module({
    imports: [
        AuthModule,
        UsersModule,
        LessonsModule,
        SurveysModule,
        ResponsesModule,
        TypeOrmModule.forRoot(dataSourceOptions)
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}