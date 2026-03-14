import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"
import { PASSWORD_MIN_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class SignInDto {
    @ApiProperty({
        description: "Почта пользователя",
        example: "user123@mail.example",
        type: String,
    })
    @IsString()
    @IsEmail({}, { message: "Email is required" })
    email: string

    @ApiProperty({
        description: "Пароль пользователя",
        example: "securePassword123",
        type: String,
    })
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(PASSWORD_MIN_LENGTH, {
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
    })
    password: string
}