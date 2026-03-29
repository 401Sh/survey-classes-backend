import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDate, IsOptional } from "class-validator"

export class UpdateSubscriptionPaymentBodyDto {
    @ApiPropertyOptional({
        description: "Дата оплаты",
        example: "2024-05-27T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    paidAt: Date = new Date()
}