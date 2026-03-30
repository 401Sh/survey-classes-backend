import { ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsBoolean, IsOptional } from "class-validator"

export class GetManagePricingTierQueryDto {
    @ApiPropertyOptional({
        description: "Доступен ли тариф пользователям",
        example: false,
        type: Boolean,
    })
    @Transform(({ value }) => {
        if (value === "true") return true
        if (value === "false") return false
        return value
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}