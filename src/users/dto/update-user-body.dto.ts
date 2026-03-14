import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString, MaxLength } from "class-validator"
import { LABEL_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class UpdateUserBodyDto {
    @ApiPropertyOptional({
        description: "Имя пользователя",
        example: "Adam",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(LABEL_MAX_LENGTH, {
        message: `FirstName must be at most ${LABEL_MAX_LENGTH} characters`
    })
    firstName: string

    @ApiPropertyOptional({
        description: "Фамилия пользователя",
        example: "Smith",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(LABEL_MAX_LENGTH, {
        message: `SecondName must be at most ${LABEL_MAX_LENGTH} characters`
    })
    secondName: string
}