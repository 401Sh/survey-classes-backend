import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, MaxLength } from "class-validator";
import { TITLE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant";

export class UpdateQuestionOptionBodyDto {
    @IsString()
    @IsOptional()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `Label must be at most ${TITLE_MAX_LENGTH} characters`
    })
    label?: string

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    position?: number
}