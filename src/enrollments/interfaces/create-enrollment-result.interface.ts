import { EnrollmentEntity } from "../entities/enrollment.entity"

export interface CreateEnrollmentResult {
    enrollment: EnrollmentEntity
    requiresSurvey: boolean
    surveyId: number | null
}