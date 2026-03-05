import { Module } from "@nestjs/common"
import { SurveysController } from "./surveys.controller"
import { SurveysService } from "./surveys.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SurveyEntity } from "./entities/survey.entity"
import { QuestionEntity } from "./entities/question.entity"
import { QuestionOptionEntity } from "./entities/question-option.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SurveyEntity,
            QuestionEntity,
            QuestionOptionEntity,
        ]),
    ],
    controllers: [SurveysController],
    providers: [SurveysService],
})
export class SurveysModule {}