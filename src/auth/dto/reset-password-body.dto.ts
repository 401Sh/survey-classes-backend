import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNotEmpty, IsString, MinLength } from "class-validator"
import { PASSWORD_MIN_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class ResetPasswordBodyDto {
    @ApiProperty({
        description: "Reset токен для восстановления пароля",
        type: String,
    })
    @Type(() => String)
    @IsString()
    resetToken: string

    @ApiProperty({
        description: "Пароль пользователя",
        example: "securePassword123",
        type: String,
    })
    @Type(() => String)
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(PASSWORD_MIN_LENGTH, {
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
    })
    password: string
}