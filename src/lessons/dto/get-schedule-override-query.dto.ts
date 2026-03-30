import { IsDate, IsEnum, IsOptional } from "class-validator"
import { ScheduleOverrideStatus } from "../enums/schedule-override-status.enum"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class GetScheduleOverrideQueryDto {
    @ApiPropertyOptional({
        description: "Дата с которой искать изменение расписания",
        example: "2026-03-30T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateFrom: Date = new Date()

    @ApiPropertyOptional({
        description: "Дата до которой искать изменение расписания",
        example: "2027-02-14T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dateTo?: Date
}