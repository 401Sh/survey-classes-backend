import { IsBoolean, IsOptional } from "class-validator"
import { Transform } from "class-transformer"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { GetLessonListQueryDto } from "./get-lesson-list-query.dto"

export class GetManageLessonListQueryDto extends GetLessonListQueryDto {
    @ApiPropertyOptional({
        description: "Доступно ли занятие для пользователей",
        example: true,
        type: Boolean,
    })
    @Transform(({ value }) => {
        if (value === "true") return true
        if (value === "false") return false
        return value
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}