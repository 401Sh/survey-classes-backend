import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from "class-validator"
import { TEXT_MAX_LENGTH, LABEL_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

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
    @MaxLength(LABEL_MAX_LENGTH, {
        message: `Description must be at most ${LABEL_MAX_LENGTH} characters`
    })
    title?: string

    @ApiPropertyOptional({
        description: "Описание опроса",
        example: "Some test text for survey",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(TEXT_MAX_LENGTH, {
        message: `Description must be at most ${TEXT_MAX_LENGTH} characters`
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