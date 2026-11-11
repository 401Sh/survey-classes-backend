import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { IManagePricingTiersService } from "../interfaces/manage-pricing-tiers-service.interface"
import { UpdatePricingTierBodyDto } from "../dto"
import { PricingTierRepository } from "../abstracts/pricing-tier-repository.abstract"

@Injectable()
export class ManagePricingTiersService implements IManagePricingTiersService {
    private readonly logger = new Logger(ManagePricingTiersService.name)

    constructor(private readonly pricingTierRepository: PricingTierRepository) {}

    async findById(id: number) {
        const pricingTier = await this.pricingTierRepository.findById(id)

        if (!pricingTier) {
            this.logger.log(`No pricing tier with id: ${id}`)
            throw new NotFoundException(`Pricing tier with id ${id} not found`)
        }

        this.logger.log(`Finded pricing tier with id: ${id}`)
        this.logger.debug("Get pricing tier: ", pricingTier)
        return pricingTier
    }


    async update(tierId: number, data: UpdatePricingTierBodyDto) {
        const updateResult = await this.pricingTierRepository.update(tierId, data)

        if (!updateResult) {
            this.logger.debug(`Cannot update pricing tier with id: ${tierId}`)
            throw new NotFoundException("Pricing tier not found")
        }
    
        this.logger.log(`Pricing tier with id ${tierId} updated successfully`)
    }


    async delete(tierId: number) {
        this.logger.log(`Deleting pricing tier with id: ${tierId}`)
        const deleteResult = await this.pricingTierRepository.softDelete(tierId)

        if (!deleteResult) {
            this.logger.log(`Cannot delete pricing tier. No pricing tier with id: ${tierId}`)
            throw new NotFoundException(`Pricing tier with id ${tierId} not found`)
        }
    }
}