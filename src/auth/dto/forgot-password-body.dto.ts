import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsEmail, IsString } from "class-validator"

export class ForgotPasswordBodyDto {
    @ApiProperty({
        description: "Почта пользователя",
        example: "user123@mail.example",
        type: String,
    })
    @Type(() => String)
    @IsString()
    @IsEmail({}, { message: "Email is required" })
    email: string
}