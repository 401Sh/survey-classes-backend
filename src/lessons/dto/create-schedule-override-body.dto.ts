import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDate, IsEnum, IsOptional, IsString } from "class-validator"
import { ScheduleOverrideStatus } from "../enums/schedule-override-status.enum"

export class CreateScheduleOverrideBodyDto {
    @ApiProperty({
        description: "Дата измененного занятия",
        example: "2026-03-15",
        type: String,
    })
    @Type(() => Date)
    @IsDate()
    date: Date

    @ApiProperty({
        description: "Статус занятия",
        example: ScheduleOverrideStatus.CANCELLED,
        enum: ScheduleOverrideStatus,
    })
    @IsEnum(ScheduleOverrideStatus)
    status: ScheduleOverrideStatus

    @ApiPropertyOptional({
        description: "Время начала занятия",
        example: "12:30",
        type: String,
    })
    @IsString()
    @IsOptional()
    startTime?: string

    @ApiPropertyOptional({
        description: "Адрес проведения занятия",
        example: "London, 221B Baker Street",
        type: String,
    })
    @IsString()
    @IsOptional()
    address?: string

    @ApiPropertyOptional({
        description: "Информация об изменении занятия",
        example: "holiday weekends",
        type: String,
    })
    @IsString()
    @IsOptional()
    note?: string
}