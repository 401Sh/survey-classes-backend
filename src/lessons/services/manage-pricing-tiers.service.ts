import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { Repository } from "typeorm"
import { UpdatePricingTierBodyDto } from "../dto/update-pricing-tier-body.dto"

@Injectable()
export class ManagePricingTiersService {
    private readonly logger = new Logger(ManagePricingTiersService.name)

    constructor(
        @InjectRepository(LessonPricingTierEntity)
        private pricingTierRepository: Repository<LessonPricingTierEntity>,
    ) {}

    async findById(id: number) {
        const pricingTier = await this.pricingTierRepository.findOne({
            where: { id },
        })

        if (!pricingTier) {
            this.logger.log(`No pricing tier with id: ${id}`)
            throw new NotFoundException(`Pricing tier with id ${id} not found`)
        }

        this.logger.log(`Finded pricing tier with id: ${id}`)
        this.logger.debug("Get pricing tier: ", pricingTier)
        return pricingTier
    }


    async update(tierId: number, data: UpdatePricingTierBodyDto) {
        const updateResult = await this.pricingTierRepository.update(
            { id: tierId },
            { ...data },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update pricing tier with id: ${tierId}`)
            throw new NotFoundException("Pricing tier not found")
        }
    
        this.logger.log(`Pricing tier with id ${tierId} updated successfully`)
        return updateResult
    }


    async delete(tierId: number) {
        this.logger.log(`Deleting pricing tier with id: ${tierId}`)
        const deleteResult = await this.pricingTierRepository.delete({ id: tierId })

        if (deleteResult.affected === 0) {
            this.logger.log(`Cannot delete pricing tier. No pricing tier with id: ${tierId}`)
            throw new NotFoundException(`Pricing tier with id ${tierId} not found`)
        }

        return deleteResult
    }
}