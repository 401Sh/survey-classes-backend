import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"
import { QuestionType } from "../enums/question-type.enum"
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator"

export class CreateQuestionBodyDto {
    @IsString()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `Title must be at most ${TITLE_MAX_LENGTH} characters`
    })
    label: string

    @IsString()
    @IsOptional()
    @MaxLength(DESCRIPTION_MAX_LENGTH, {
        message: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`
    })
    description?: string

    @IsEnum(QuestionType)
    @IsOptional()
    type: QuestionType = QuestionType.TEXT
}