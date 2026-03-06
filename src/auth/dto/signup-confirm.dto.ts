import { Type } from "class-transformer"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class SignUpConfirmDto {
    @Type(() => String)
    @IsString()
    @IsEmail({}, { message: "Email is required" })
    email: string

    @Type(() => String)
    @IsString()
    @IsNotEmpty({ message: "Code is required" })
    code: string
}