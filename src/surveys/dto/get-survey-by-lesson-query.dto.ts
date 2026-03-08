import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt } from "class-validator"

export class GetSurveyByLessonQueryDto {
    @ApiProperty({
        description: "ID занятия",
        example: 13,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    lessonId: number
}