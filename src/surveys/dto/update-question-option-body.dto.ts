import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator"
import { POSITION_MIN_VALUE, TITLE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

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
    @Min(POSITION_MIN_VALUE, {
        message: `Position cannot be less than ${POSITION_MIN_VALUE}`,
    })
    position?: number
}