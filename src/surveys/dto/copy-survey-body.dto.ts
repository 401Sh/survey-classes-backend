import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional } from "class-validator"

export class CopySurveyBodyDto {
    @ApiPropertyOptional({
        description: "ID Занятия на которое нужно скопировать опрос",
        example: 8,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    lessonId?: number
}