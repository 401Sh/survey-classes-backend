import { UpdatePricingTierBodyDto } from "../dto"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"

export interface IManagePricingTiersService {
    findById(id: number): Promise<LessonPricingTierEntity>
    update(tierId: number, data: UpdatePricingTierBodyDto): Promise<void>
    delete(tierId: number): Promise<void>
}