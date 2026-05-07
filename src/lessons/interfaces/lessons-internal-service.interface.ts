import { LessonEntity } from "../entities/lesson.entity"

export interface ILessonsInternalService {
    exists(id: number): Promise<boolean>
    findSimplifiedWithSurvey(id: number): Promise<LessonEntity>
    updateSurveyRequirement(id: number, requiresSurvey: boolean): Promise<void>
}