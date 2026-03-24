import { PartialType } from "@nestjs/swagger"
import { CreatePricingTierBodyDto } from "./create-pricing-tier-body.dto"

export class UpdatePricingTierBodyDto extends PartialType(CreatePricingTierBodyDto) {}