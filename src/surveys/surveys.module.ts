import { Module } from "@nestjs/common"
import { SurveysController } from "./surveys.controller"
import { SurveysService } from "./surveys.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SurveyEntity } from "./entities/survey.entity"
import { QuestionEntity } from "./entities/question.entity"
import { QuestionOptionEntity } from "./entities/question-option.entity"
import { LessonsModule } from "src/lessons/lessons.module"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SurveyEntity,
            QuestionEntity,
            QuestionOptionEntity,
        ]),
        LessonsModule,
    ],
    controllers: [SurveysController],
    providers: [SurveysService],
})
export class SurveysModule {}