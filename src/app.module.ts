import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { LessonsModule } from "./lessons/classes.module"
import { SurveysModule } from "./surveys/surveys.module"
import { ResponsesModule } from "./responses/responses.module"

@Module({
  imports: [AuthModule, UsersModule, LessonsModule, SurveysModule, ResponsesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}