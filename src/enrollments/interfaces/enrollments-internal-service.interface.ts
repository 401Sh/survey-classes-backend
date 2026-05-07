import { EntityManager } from "typeorm"
import { EnrollmentEntity } from "../entities/enrollment.entity"

export interface IEnrollmentsInternalService {
    findOwnedWithLessonAndSurvey(id: number, userId: number): Promise<EnrollmentEntity>
    activateWithManager(enrollmentId: number, manager: EntityManager): Promise<void>
}