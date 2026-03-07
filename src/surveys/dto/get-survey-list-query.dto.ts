import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, Matches, Min } from "class-validator"
import { PAGE_MIN_VALUE, SURVEY_AMOUNT_MIN_VALUE } from "src/common/constants/dto-request-limits.constant"

export class GetSurveyListQueryDto {
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @Min(SURVEY_AMOUNT_MIN_VALUE, {
        message: `Limit cannot be less than ${SURVEY_AMOUNT_MIN_VALUE}`,
    })
    limit: number = SURVEY_AMOUNT_MIN_VALUE

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @Min(PAGE_MIN_VALUE, {
        message: `Page cannot be less than ${PAGE_MIN_VALUE}`,
    })
    page: number = PAGE_MIN_VALUE

    @IsString()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date must be in the format YYYY-MM-DD",
    })
    dateFrom?: string
    
    @IsString()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date must be in the format YYYY-MM-DD",
    })
    dateTo?: string
}