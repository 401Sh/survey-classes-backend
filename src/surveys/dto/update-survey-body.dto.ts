import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from "class-validator"
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class UpdateSurveyBodyDto {
    @ApiPropertyOptional({
        description: "ID занятия",
        example: 13,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    lessonId?: number
    
    @ApiPropertyOptional({
        description: "Заголовок опроса",
        example: "New test survey",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `Description must be at most ${TITLE_MAX_LENGTH} characters`
    })
    title?: string

    @ApiPropertyOptional({
        description: "Описание опроса",
        example: "Some test text for survey",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(DESCRIPTION_MAX_LENGTH, {
        message: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`
    })
    description?: string

    @ApiPropertyOptional({
        description: "Доступен ли опрос для пользователей",
        example: true,
        type: Boolean,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}