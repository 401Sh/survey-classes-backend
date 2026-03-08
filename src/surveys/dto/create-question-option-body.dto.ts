import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength } from "class-validator"
import { TITLE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class CreateQuestionOptionBodyDto {
    @ApiProperty({
        description: "Текст вопроса",
        example: "Is this test question?",
        type: String,
    })
    @IsString()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `Label must be at most ${TITLE_MAX_LENGTH} characters`
    })
    label: string
}