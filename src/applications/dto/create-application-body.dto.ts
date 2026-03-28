import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsDate, ValidateNested } from "class-validator"
import { CreateAnswerBodyDto } from "./create-answer-body.dto"
import { CreateEnrollmentBodyDto } from "./create-enrollment-body.dto"

export class CreateApplicationBodyDto extends CreateEnrollmentBodyDto {
    @ApiProperty({
        description: "Дата согласия",
        example: "2024-05-27T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    consentedAt: Date

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