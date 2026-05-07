import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"

export interface ILessonsPricingTiersInternalService {
    findActiveAndLinked(id: number, lessonId: number): Promise<LessonPricingTierEntity>
}