import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString, Matches, Min } from "class-validator"
import { PAGE_MIN_VALUE, AMOUNT_MIN_VALUE } from "src/common/constants/dto-request-limits.constant"
import { SortDirection } from "src/common/enums/sort-direction.enum"

export class GetSurveyListQueryDto {
    @ApiPropertyOptional({
        description: "Количество опросов на страницу",
        example: 5,
        type: Number,
        default: AMOUNT_MIN_VALUE,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @Min(AMOUNT_MIN_VALUE, {
        message: `Limit cannot be less than ${AMOUNT_MIN_VALUE}`,
    })
    limit: number = AMOUNT_MIN_VALUE

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
        description: "Дата с которой искать опросы",
        example: "2026-01-27T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateFrom?: Date
    
    @ApiPropertyOptional({
        description: "Дата до которой искать опросы",
        example: "2026-02-14T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateTo?: Date

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
        example: SortDirection.DESC,
        enum: SortDirection,
        default: SortDirection.ASC,
    })
    @IsEnum(SortDirection)
    @IsOptional()
    sortDirection: SortDirection = SortDirection.ASC
}