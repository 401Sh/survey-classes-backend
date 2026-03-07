import { Type } from "class-transformer"
import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator"
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

// TODO: add string limits
export class UpdateSurveyBodyDto {
    @IsString()
    @IsOptional()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `Description must be at most ${TITLE_MAX_LENGTH} characters`
    })
    title: string

    @IsString()
    @IsOptional()
    @MaxLength(DESCRIPTION_MAX_LENGTH, {
        message: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`
    })
    description?: string

    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive: boolean = false
}