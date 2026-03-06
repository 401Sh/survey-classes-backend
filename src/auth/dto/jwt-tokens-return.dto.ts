import { Type } from "class-transformer"
import { IsString } from "class-validator"

export class JWTTokensReturnDto {
    @Type(() => String)
    @IsString()
    accessToken: string

    @Type(() => String)
    @IsString()
    refreshToken: string
}