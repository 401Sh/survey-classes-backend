import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt } from "class-validator"

export class CreateEnrollmentSubscriptionBodyDto {
    @ApiProperty({
        description: "ID тарифа оплаты",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    pricingTierId: number
}