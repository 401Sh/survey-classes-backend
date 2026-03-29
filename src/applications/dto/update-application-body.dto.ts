import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsArray, ValidateNested } from "class-validator"
import { CreateAnswerBodyDto } from "./create-answer-body.dto"

export class UpdateApplicationBodyDto {
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