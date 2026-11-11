import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"

export type CreatePricingTierData = {
    label: string,
    price: number,
    sessionsCount: number,
    isActive: boolean,
}

export type PricingTierData = Partial<CreatePricingTierData>

export abstract class PricingTierRepository {
    // public
    abstract findActiveByIdAndLessonId(id: number, lessonId: number): Promise<LessonPricingTierEntity | null>
    abstract findActiveByLessonId(lessonId: number): Promise<LessonPricingTierEntity[]>

    // manage
    abstract create(lessonId: number, data: CreatePricingTierData): Promise<LessonPricingTierEntity>
    abstract findById(id: number): Promise<LessonPricingTierEntity | null>
    abstract findAllByLessonId(lessonId: number, isActive?: boolean): Promise<LessonPricingTierEntity[]>
    abstract update(id: number, data: PricingTierData): Promise<boolean>
    abstract softDelete(id: number): Promise<boolean>
}