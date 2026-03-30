import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDate, IsOptional } from "class-validator"

export class RefundSubscriptionPaymentBodyDto {
    @ApiPropertyOptional({
        description: "Дата возврата оплаты",
        example: "2024-05-27T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    refundedAt: Date = new Date()
}