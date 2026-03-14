import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class JWTTokensReturnDto {
    @ApiProperty({
        description: "Access токен доступа",
        type: String,
    })
    @IsString()
    accessToken: string

    @ApiProperty({
        description: "Refresh токен для обновления токена доступа",
        type: String,
    })
    @IsString()
    refreshToken: string
}