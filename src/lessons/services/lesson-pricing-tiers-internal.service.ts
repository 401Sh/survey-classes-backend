import { Injectable, NotFoundException } from "@nestjs/common"
import { ILessonsPricingTiersInternalService } from "../interfaces/lesson-pricing-tiers-internal-service.interface"
import { PricingTierRepository } from "../abstracts/pricing-tier-repository.abstract"

@Injectable()
export class LessonPricingTiersInternalService implements ILessonsPricingTiersInternalService {
    constructor(private readonly pricingTierRepository: PricingTierRepository) {}

    async findActiveAndLinked(id: number, lessonId: number) {
        const pricingTier = await this.pricingTierRepository.findActiveByIdAndLessonId(id, lessonId)

        if (!pricingTier) throw new NotFoundException(`Pricing tier with id ${id} not found`)

        return pricingTier
    }
}