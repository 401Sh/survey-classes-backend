import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDate, IsEnum, IsInt, IsOptional, Min } from "class-validator"
import { AMOUNT_MIN_VALUE, PAGE_MIN_VALUE } from "src/common/constants/dto-request-limits.constant"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"

export class GetEnrollmentListQueryDto {
    @ApiPropertyOptional({
        description: "Количество записей на занятий на страницу",
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
        description: "Дата с которой искать записи",
        example: "2026-01-27T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateFrom?: Date
    
    @ApiPropertyOptional({
        description: "Дата до которой искать записи",
        example: "2026-02-14T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateTo?: Date

    @ApiPropertyOptional({
        description: "Статус записи",
        example: EnrollmentStatus.LEFT,
        enum: EnrollmentStatus,
    })
    @IsEnum(EnrollmentStatus)
    @IsOptional()
    status?: EnrollmentStatus

    @ApiPropertyOptional({
        description: "ID занятия",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    lessonId?: number

    @ApiPropertyOptional({
        description: "ID родителя",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    parentId?: number

    @ApiPropertyOptional({
        description: "ID ребенка посещающего занятие",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    childId?: number

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