import { Type } from "class-transformer"
import { IsInt, IsOptional } from "class-validator"

export class CopySurveyBodyDto {
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    lessonId?: number
}