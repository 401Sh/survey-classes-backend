import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { CopySurveyBodyDto } from "../dto/copy-survey-body.dto"
import { CreateQuestionBodyDto } from "../dto/create-question-body.dto"
import { CreateSurveyBodyDto } from "../dto/create-survey-body.dto"
import { GetSurveyListQueryDto } from "../dto/get-survey-list-query.dto"
import { UpdateSurveyBodyDto } from "../dto/update-survey-body.dto"
import { QuestionEntity } from "../entities/question.entity"
import { SurveyEntity } from "../entities/survey.entity"

export interface IManageSurveysService {
    create(userId: number, data: CreateSurveyBodyDto): Promise<SurveyEntity>
    createQuestion(surveyId: number, data: CreateQuestionBodyDto): Promise<QuestionEntity>
    copy(surveyId: number, data: CopySurveyBodyDto): Promise<SurveyEntity>
    findAll(query: GetSurveyListQueryDto): Promise<PaginatedResult<SurveyEntity>>
    findById(id: number): Promise<SurveyEntity>
    findAllQuestionsBySurveyId(surveyId: number): Promise<QuestionEntity[]>
    update(surveyId: number, data: UpdateSurveyBodyDto): Promise<void>
    delete(surveyId: number): Promise<void>
}