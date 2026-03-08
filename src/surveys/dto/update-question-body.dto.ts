import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator"
import {
    DESCRIPTION_MAX_LENGTH,
    POSITION_MIN_VALUE,
    TITLE_MAX_LENGTH,
} from "src/common/constants/dto-request-limits.constant"
import { QuestionType } from "../enums/question-type.enum"
import { Type } from "class-transformer"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateQuestionBodyDto {
    @ApiPropertyOptional({
        description: "Текст вопроса",
        example: "How was jedi Mace Windu?",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `Label must be at most ${TITLE_MAX_LENGTH} characters`
    })
    label?: string

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
        type: Enumerator<QuestionType>,
    })
    @IsEnum(QuestionType)
    @IsOptional()
    type?: QuestionType

    @ApiPropertyOptional({
        description: "Позиция вопроса в опросе",
        example: 5,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @Min(POSITION_MIN_VALUE, {
        message: `Position cannot be less than ${POSITION_MIN_VALUE}`,
    })
    position?: number
}