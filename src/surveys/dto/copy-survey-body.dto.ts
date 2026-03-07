import { Type } from "class-transformer"
import { IsInt } from "class-validator"

export class CopySurveyBodyDto {
    @Type(() => Number)
    @IsInt()
    lessonId: number
}