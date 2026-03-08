import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from "class-validator"
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"
import { QuestionType } from "../enums/question-type.enum"
import { Type } from "class-transformer"

export class UpdateQuestionBodyDto {
    @IsString()
    @IsOptional()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `Label must be at most ${TITLE_MAX_LENGTH} characters`
    })
    label?: string

    @IsString()
    @IsOptional()
    @MaxLength(DESCRIPTION_MAX_LENGTH, {
        message: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`
    })
    description?: string

    @IsEnum(QuestionType)
    @IsOptional()
    type?: QuestionType

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    position?: number
}