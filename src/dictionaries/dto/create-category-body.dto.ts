import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength } from "class-validator"
import { LABEL_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

// TODO: add @Length(n, m) decorator to all string fields
export class CreateCategoryBodyDto {
    @ApiProperty({
        description: "Название категории",
        example: "Спорт",
        type: String,
    })
    @IsString()
    @MaxLength(LABEL_MAX_LENGTH, {
        message: `Name must be at most ${LABEL_MAX_LENGTH} characters`
    })
    name: string
}