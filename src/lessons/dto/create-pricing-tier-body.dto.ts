import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator"
import { NOT_ZERO_INT_MIN_VALUE, PRICE_MIN_VALUE } from "src/common/constants/dto-request-limits.constant"

// TODO: add constant for decimal places, also add constant in related entity
export class CreatePricingTierBodyDto {
    @ApiProperty({
        description: "Название тарифа (абонемент, 1 занятие и тд)",
        example: "10 days",
        type: String,
    })
    @IsString()
    label: string

    @ApiProperty({
        description: "Цена (до двух знаков после запятой)",
        example: 120.32,
        type: Number,
    })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(PRICE_MIN_VALUE, {
        message: `Price cannot be less than ${PRICE_MIN_VALUE}`,
    })
    price: number

    @ApiPropertyOptional({
        description: "Количество занятий для посещения",
        example: 8,
        type: Number,
        default: 1,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @Min(NOT_ZERO_INT_MIN_VALUE, {
        message: `Session count cannot be less than ${NOT_ZERO_INT_MIN_VALUE}`,
    })
    sessionsCount: number = 1

    @ApiPropertyOptional({
        description: "Доступен ли тариф пользователям",
        example: false,
        type: Boolean,
        default: true,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive: boolean = true
}