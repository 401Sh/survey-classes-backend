import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"
import { QuestionType } from "../enums/question-type.enum"
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateQuestionBodyDto {
    @ApiProperty({
        description: "Текст вопроса",
        example: "How was jedi Mace Windu?",
        type: String,
    })
    @IsString()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `Title must be at most ${TITLE_MAX_LENGTH} characters`
    })
    label: string

    @ApiPropertyOptional({
        description: "Описание или дополнительная инфомрация вопроса",
        example: "Clue - purple color",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(DESCRIPTION_MAX_LENGTH, {
        message: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`
    })
    description?: string

    @ApiPropertyOptional({
        description: "Тип вопроса - text, radio, checkbox",
        example: QuestionType.RADIO,
        enum: QuestionType,
        default: QuestionType.TEXT,
    })
    @IsEnum(QuestionType)
    @IsOptional()
    type: QuestionType = QuestionType.TEXT
}