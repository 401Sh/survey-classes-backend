import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsDate, IsInt, ValidateNested } from "class-validator"
import { CreateAnswerBodyDto } from "./create-answer-body.dto"

export class CreateApplicationBodyDto {
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
        description: "Дата согласия",
        example: "2024-05-27T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    consentedAt: string

    @ApiProperty({
        description: "ID тарифа оплаты",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    pricingTierId: number

    @ApiProperty({
        description: "Ответы на вопросы",
        example: [
            { questionId: 1, textValue: "Текст ответа" },
            { questionId: 2, selectedOptionId: 3 },
            { questionId: 3, selectedOptionId: 5 },
        ],
        type: CreateAnswerBodyDto,
    })
    @Type(() => CreateAnswerBodyDto)
    @ValidateNested({ each: true })
    @IsArray()
    answers: CreateAnswerBodyDto[]
}