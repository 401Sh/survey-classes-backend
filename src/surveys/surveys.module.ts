import { Module } from "@nestjs/common"
import { SurveysController } from "./controllers/surveys.controller"
import { SurveysService } from "./services/surveys.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SurveyEntity } from "./entities/survey.entity"
import { QuestionEntity } from "./entities/question.entity"
import { QuestionOptionEntity } from "./entities/question-option.entity"
import { LessonsModule } from "src/lessons/lessons.module"
import { ManageSurveysController } from "./controllers/manage-surveys.controller"
import { ManageQuestionsController } from "./controllers/manage-questions.controller"
import { ManageQuestionOptionsController } from "./controllers/manage-question-options.controller"
import { ManageSurveysService } from "./services/manage-surveys.service"
import { ManageQuestionsService } from "./services/manage-questions.service"
import { ManageQuestionOptionsService } from "./services/manage-question-options.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SurveyEntity,
            QuestionEntity,
            QuestionOptionEntity,
        ]),
        LessonsModule,
    ],
    controllers: [
        SurveysController,
        ManageSurveysController,
        ManageQuestionsController,
        ManageQuestionOptionsController,
    ],
    providers: [
        SurveysService,
        ManageSurveysService,
        ManageQuestionsService,
        ManageQuestionOptionsService,
    ],
})
export class SurveysModule {}