import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class ForgotPasswordConfirmBodyDto {
    @ApiProperty({
        description: "Почта пользователя",
        example: "user123@mail.example",
        type: String,
    })
    @IsString()
    @IsEmail({}, { message: "Email is required" })
    email: string

    @ApiProperty({
        description: "Код подтверждения",
        type: String,
    })
    @IsString()
    @IsNotEmpty({ message: "Code is required" })
    code: string
}