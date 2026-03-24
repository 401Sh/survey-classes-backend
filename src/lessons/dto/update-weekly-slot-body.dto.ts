import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from "class-validator"
import { DayOfWeek } from "../enums/day-of-week.enum"

export class UpdateWeeklySlotBodyDto {
    @ApiPropertyOptional({
        description: "Время начала занятия",
        example: "12:30",
        type: String,
    })
    @IsString()
    @IsOptional()
    startTime?: string

    @ApiPropertyOptional({
        description: "Длительность занятия в минутах",
        example: 45,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    durationMinutes?: number

    @ApiPropertyOptional({
        description: "Адрес проведения занятия",
        example: "London, 221B Baker Street",
        type: String,
    })
    @IsString()
    @IsOptional()
    address?: string

    @ApiPropertyOptional({
        description: "Доступен ли день пользователю",
        example: false,
        type: Boolean,
        default: true,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive?: boolean

    @ApiPropertyOptional({
        description: "Номер дня недели, в которые проходят занятие",
        example: DayOfWeek.SATURDAY,
        enum: DayOfWeek,
    })
    @IsEnum(DayOfWeek)
    @IsOptional()
    dayOfWeek?: DayOfWeek
}