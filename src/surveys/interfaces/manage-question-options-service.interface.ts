import { UpdateQuestionOptionBodyDto } from "../dto/update-question-option-body.dto"
import { QuestionOptionEntity } from "../entities/question-option.entity"

export interface IManageQuestionOptionsService {
    findById(id: number): Promise<QuestionOptionEntity | null>
    update(questionOptionId: number, data: UpdateQuestionOptionBodyDto): Promise<void>
    delete(questionOptionId: number): Promise<void>
}