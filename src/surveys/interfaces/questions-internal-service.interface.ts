import { EntityManager } from "typeorm"
import { QuestionEntity } from "../entities/question.entity"

export interface IQuestionsInternalService {
    findByIdsAndSurveyIdInTransaction(
        surveyId: number,
        questionIds: number[],
        manager: EntityManager,
    ): Promise<QuestionEntity[]>
}