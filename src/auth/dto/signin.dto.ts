import { Type } from "class-transformer"
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"
import { PASSWORD_MIN_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class SignInDto {
    @Type(() => String)
    @IsString()
    @IsEmail({}, { message: "Email is required" })
    email: string

    @Type(() => String)
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(PASSWORD_MIN_LENGTH, {
        message: "Password must be at least 6 characters long.",
    })
    password: string
}