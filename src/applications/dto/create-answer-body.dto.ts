import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, MaxLength } from "class-validator"
import { TEXT_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class CreateAnswerBodyDto {
    @ApiProperty({
        description: "ID вопроса",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    questionId: number

    @ApiPropertyOptional({
        description: "Текст ответа",
        example: "Probably yes",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(TEXT_MAX_LENGTH, {
        message: `Text must be at most ${TEXT_MAX_LENGTH} characters`
    })
    textValue?: string

    @ApiPropertyOptional({
        description: "ID вариантов ответа. Для вопросов типа CHECKBOX - несколько вариантов ответа, для RADIO - один",
        example: [1, 2],
        isArray: true,
        type: () => Number,
    })
    @IsArray()
    @ArrayUnique()
    @Type(() => Number)
    @IsInt({ each: true })
    @IsOptional()
    selectedOptionIds?: number[]
}