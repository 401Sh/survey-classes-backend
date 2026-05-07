import { SurveyEntity } from "../entities/survey.entity"

export interface ISurveysService {
    findById(id: number): Promise<SurveyEntity>
}