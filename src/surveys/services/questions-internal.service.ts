import { Injectable } from "@nestjs/common"
import { QuestionEntity } from "../entities/question.entity"
import { EntityManager, In } from "typeorm"
import { IQuestionsInternalService } from "../interfaces/questions-internal-service.interface"

@Injectable()
export class QuestionsInternalService implements IQuestionsInternalService {
    async findByIdsAndSurveyIdInTransaction(surveyId: number, questionIds: number[], manager: EntityManager) {
        const questions = await manager.find(QuestionEntity, {
            where: {
                id: In(questionIds),
                survey: { id: surveyId },
            },
            relations: { options: true },
        })

        return questions
    }
}