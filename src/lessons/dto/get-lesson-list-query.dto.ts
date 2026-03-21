import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDate, IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator"
import {
    AMOUNT_MIN_VALUE,
    LABEL_MAX_LENGTH,
    PAGE_MIN_VALUE,
    PRICE_MIN_VALUE,
} from "src/common/constants/dto-request-limits.constant"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { ScheduleStatus } from "../enums/schedule-status.enum"

export class GetLessonListQueryDto {
    @ApiPropertyOptional({
        description: "Количество занятий на страницу",
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
        description: 'Дата с которой искать занятия на которые доступна запись',
        example: '2026-01-27T21:10:42Z',
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateFrom?: Date
    
    @ApiPropertyOptional({
        description: "Дата до которой искать занятия на которые доступна запись",
        example: "2026-02-14T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateTo?: Date

    @ApiPropertyOptional({
        description: "ID категории",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    categoryId?: number

    @ApiPropertyOptional({
        description: "Текст для поиска по названию или описанию",
        example: "test lesson",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(LABEL_MAX_LENGTH, {
        message: `Text search must be at most ${LABEL_MAX_LENGTH} characters`
    })
    search?: string

    @ApiPropertyOptional({
        description: "Минимальная цена (по любому активному тиру занятия)",
        example: 500,
        type: Number,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(PRICE_MIN_VALUE, {
        message: `Price cannot be less than ${PRICE_MIN_VALUE}`,
    })
    priceFrom?: number

    @ApiPropertyOptional({
        description: "Максимальная цена (по любому активному тиру занятия)",
        example: 5000,
        type: Number,
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(PRICE_MIN_VALUE, {
        message: `Price cannot be less than ${PRICE_MIN_VALUE}`,
    })
    priceTo?: number

    @ApiPropertyOptional({
        description: "Статус занятий по датам проведения — upcoming (ещё не начались), ongoing (идут сейчас)",
        example: ScheduleStatus.ONGOING,
        enum: ScheduleStatus,
    })
    @IsEnum(ScheduleStatus)
    @IsOptional()
    scheduleStatus?: ScheduleStatus

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