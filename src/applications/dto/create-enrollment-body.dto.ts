import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt } from "class-validator"

export class CreateEnrollmentBodyDto {
    @ApiProperty({
        description: "ID занятия",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    lessonId: number

    @ApiProperty({
        description: "ID ребенка",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    childId: number

    @ApiProperty({
        description: "ID тарифа оплаты",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    pricingTierId: number
}