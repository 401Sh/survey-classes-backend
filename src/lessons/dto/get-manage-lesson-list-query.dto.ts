import { IsBoolean, IsOptional } from "class-validator"
import { Type } from "class-transformer"
import { ApiPropertyOptional, PartialType } from "@nestjs/swagger"
import { GetLessonListQueryDto } from "./get-lesson-list-query.dto"

export class GetManageLessonListQueryDto extends GetLessonListQueryDto {
    @ApiPropertyOptional({
        description: "Доступно ли занятие для пользователей",
        example: true,
        type: Boolean,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}