import { EntityManager } from "typeorm"
import { EnrollmentEntity } from "../entities/enrollment.entity"

export interface IEnrollmentsInternalService {
    findOwnedWithLessonAndSurvey(id: number, userId: number): Promise<EnrollmentEntity>
    activateInTransaction(enrollmentId: number, manager: EntityManager): Promise<void>
}