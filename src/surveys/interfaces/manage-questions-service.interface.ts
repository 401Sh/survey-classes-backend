import { CreateQuestionOptionBodyDto } from "../dto/create-question-option-body.dto"
import { UpdateQuestionBodyDto } from "../dto/update-question-body.dto"
import { QuestionOptionEntity } from "../entities/question-option.entity"
import { QuestionEntity } from "../entities/question.entity"

export interface IManageQuestionsService {
    createQuestionOption(questionId: number, data: CreateQuestionOptionBodyDto): Promise<QuestionOptionEntity>
    findById(id: number): Promise<QuestionEntity | null>
    findAllOptionsByQuestionId(questionId: number): Promise<QuestionOptionEntity[]>
    update(questionId: number, data: UpdateQuestionBodyDto): Promise<void>
    delete(questionId: number): Promise<void>
}