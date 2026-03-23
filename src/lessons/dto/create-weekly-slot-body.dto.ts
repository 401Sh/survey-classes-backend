import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional, IsString } from "class-validator"
import { DayOfWeek } from "../enums/day-of-week.enum"

export class CreateWeeklySlotBodyDto {
    @ApiProperty({
        description: "Время начала занятия",
        example: "12:30",
        type: String,
    })
    @IsString()
    startTime: string

    @ApiProperty({
        description: "Длительность занятия в минутах",
        example: 45,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    durationMinutes: number

    @ApiProperty({
        description: "Адрес проведения занятия",
        example: "London, 221B Baker Street",
        type: String,
    })
    @IsString()
    address: string

    @ApiPropertyOptional({
        description: "Доступны ли дни пользователям",
        example: false,
        type: Boolean,
        default: true,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive: boolean = true

    @ApiProperty({
        description: "Список номеров дней недели, в которые проходят занятия",
        example: [DayOfWeek.FRIDAY, DayOfWeek.SATURDAY],
        isArray: true,
        type: () => Number,
    })
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    @Type(() => Number)
    daysOfWeek: number[] = []
}