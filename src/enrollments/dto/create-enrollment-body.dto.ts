import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsBoolean, IsDate, IsInt } from "class-validator"

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
        description: "Дата согласия на обработку данных",
        example: "2026-01-02T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    consentedAt: Date

    @ApiProperty({
        description: "Согласие на обработку данных",
        example: true,
        type: Boolean,
    })
    @Type(() => Boolean)
    @IsBoolean()
    isConsented: boolean
}