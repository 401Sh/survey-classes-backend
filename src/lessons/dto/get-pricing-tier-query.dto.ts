import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsBoolean, IsOptional } from "class-validator"

export class GetPricingTierQueryDto {
    @ApiPropertyOptional({
        description: "Доступен ли тариф пользователям",
        example: false,
        type: Boolean,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}