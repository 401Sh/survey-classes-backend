import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt } from "class-validator"

export class CreateSubscriptionBodyDto {
    @ApiProperty({
        description: "ID тира оплаты",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    pricingTierId: number
}