import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsInt, ValidateNested } from "class-validator"
import { CreateAnswerBodyDto } from "./create-answer-body.dto"

export class CreateApplicationBodyDto {
    @ApiProperty({
        description: "ID записи на занятие",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    enrollmentId: number

    @ApiProperty({
        description: "Ответы на вопросы",
        example: [
            { questionId: 1, textValue: "Текст ответа" },
            { questionId: 2, selectedOptionIds: [3] },
            { questionId: 3, selectedOptionIds: [5, 11] },
        ],
        type: CreateAnswerBodyDto,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerBodyDto)
    answers: CreateAnswerBodyDto[]
}