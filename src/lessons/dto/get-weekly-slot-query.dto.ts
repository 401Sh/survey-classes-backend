import { ApiPropertyOptional } from "@nestjs/swagger"
import { Transform, Type } from "class-transformer"
import { ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional } from "class-validator"
import { DayOfWeek } from "../enums/day-of-week.enum"

export class GetWeeklySlotQueryDto {
    @ApiPropertyOptional({
        description: "Доступны ли дни пользователям",
        example: false,
        type: Boolean,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive?: boolean

    @ApiPropertyOptional({
        description: "Список номеров дней недели, в которые проходят занятия. 0 - понедельник, 6 - воскресенье",
        example: [DayOfWeek.FRIDAY, DayOfWeek.SATURDAY],
        isArray: true,
        type: () => Number,
    })
    @Transform(({ value }) => {
        if (Array.isArray(value)) return value.map(Number)
        if (typeof value === "string") return [Number(value)]
        return value
    })
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    @Type(() => Number)
    @IsOptional()
    daysOfWeek?: number[]
}