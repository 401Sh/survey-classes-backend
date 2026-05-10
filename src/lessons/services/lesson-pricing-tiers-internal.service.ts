import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { ILessonsPricingTiersInternalService } from "../interfaces/lesson-pricing-tiers-internal-service.interface"

@Injectable()
export class LessonPricingTiersInternalService implements ILessonsPricingTiersInternalService {
    constructor(
        @InjectRepository(LessonPricingTierEntity)
        private pricingTierRepository: Repository<LessonPricingTierEntity>,
    ) {}

    async findActiveAndLinked(id: number, lessonId: number) {
        const pricingTier = await this.pricingTierRepository.findOne({
            where: {
                id,
                isActive: true,
                lesson: { id: lessonId },
            },
            select: {
                id: true,
                label: true,
                price: true,
                sessionsCount: true,
                isActive: true,
            },
        })

        if (!pricingTier) throw new NotFoundException(`Pricing tier with id ${id} not found`)

        return pricingTier
    }
}