import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsString } from "class-validator"

export class JWTTokensReturnDto {
    @ApiProperty({
        description: "Access токен доступа",
        type: String,
    })
    @Type(() => String)
    @IsString()
    accessToken: string

    @ApiProperty({
        description: "Refresh токен для обновления токена доступа",
        type: String,
    })
    @Type(() => String)
    @IsString()
    refreshToken: string
}