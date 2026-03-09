import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, Min } from "class-validator"
import { PAGE_MIN_VALUE, SURVEY_AMOUNT_MIN_VALUE } from "src/common/constants/dto-request-limits.constant"
import { SortDirection } from "src/common/enums/sort-direction.enum"

export class GetSurveyListQueryDto {
    @ApiPropertyOptional({
        description: "Количество опросов на страницу",
        example: 5,
        type: Number,
        default: SURVEY_AMOUNT_MIN_VALUE,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @Min(SURVEY_AMOUNT_MIN_VALUE, {
        message: `Limit cannot be less than ${SURVEY_AMOUNT_MIN_VALUE}`,
    })
    limit: number = SURVEY_AMOUNT_MIN_VALUE

    @ApiPropertyOptional({
        description: "Номер страницы",
        example: 2,
        type: Number,
        default: PAGE_MIN_VALUE,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @Min(PAGE_MIN_VALUE, {
        message: `Page cannot be less than ${PAGE_MIN_VALUE}`,
    })
    page: number = PAGE_MIN_VALUE

    @ApiPropertyOptional({
        description: 'Дата с которой искать опросы',
        example: '2026-01-27T21:10:42Z',
        type: Date,
    })
    @IsString()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date must be in the format YYYY-MM-DD",
    })
    dateFrom?: string
    
    @ApiPropertyOptional({
        description: "Дата до которой искать опросы",
        example: "2026-02-14T21:10:42Z",
        type: Date,
    })
    @IsString()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date must be in the format YYYY-MM-DD",
    })
    dateTo?: string

    @ApiPropertyOptional({
        description: "Доступен ли опрос для пользователей",
        example: true,
        type: Boolean,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive?: boolean

    @ApiPropertyOptional({
        description: "Направление сортировки - ASC для восходящей и DESC для нисходящей",
        example: "DESC",
        enum: SortDirection,
        default: SortDirection.ASC,
    })
    @IsEnum(SortDirection)
    @IsOptional()
    sortDirection: SortDirection = SortDirection.ASC
}