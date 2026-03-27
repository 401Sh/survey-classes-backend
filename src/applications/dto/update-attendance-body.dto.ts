import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDate, IsBoolean, IsOptional, IsString, MaxLength } from "class-validator"
import { NOTE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class UpdateAttendanceBodyDto {
    @ApiPropertyOptional({
        description: "Дата посещения занятия",
        example: "2026-02-27T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    date?: Date

    @ApiPropertyOptional({
        description: "Было ли занятие посещено",
        example: true,
        type: Boolean,
        default: false,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isPresent?: boolean

    @ApiPropertyOptional({
        description: "Заметка по поводу посещения/пропуска занятия",
        example: "Illness",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(NOTE_MAX_LENGTH, {
        message: `Note must be at most ${NOTE_MAX_LENGTH} characters`
    })
    note?: string
}