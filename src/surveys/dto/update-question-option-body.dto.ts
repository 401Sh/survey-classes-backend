import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator"
import { POSITION_MIN_VALUE, TITLE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class UpdateQuestionOptionBodyDto {
    @ApiPropertyOptional({
        description: "Текст варианта ответа",
        example: "Council member",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `Label must be at most ${TITLE_MAX_LENGTH} characters`
    })
    label?: string

    @ApiPropertyOptional({
        description: "Позиция варианта ответа в вопросе",
        example: 5,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @Min(POSITION_MIN_VALUE, {
        message: `Position cannot be less than ${POSITION_MIN_VALUE}`,
    })
    position?: number
}