import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString, MaxLength } from "class-validator"
import { LABEL_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class UpdateCategoryBodyDto {
    @ApiPropertyOptional({
        description: "Название категории",
        example: "Sport",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(LABEL_MAX_LENGTH, {
        message: `Name must be at most ${LABEL_MAX_LENGTH} characters`
    })
    name: string
}