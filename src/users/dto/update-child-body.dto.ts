import { Type } from "class-transformer"
import { IsDate, IsOptional, IsString, MaxLength } from "class-validator"
import { TITLE_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateChildBodyDto {
    @ApiPropertyOptional({
        description: "Имя ребенка",
        example: "Adam",
        type: String,
    })
    @Type(() => String)
    @IsString()
    @IsOptional()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `FirstName must be at most ${TITLE_MAX_LENGTH} characters`
    })
    firstName: string

    @ApiPropertyOptional({
        description: "Фамилия ребенка",
        example: "Smith",
        type: String,
    })
    @Type(() => String)
    @IsString()
    @IsOptional()
    @MaxLength(TITLE_MAX_LENGTH, {
        message: `SecondName must be at most ${TITLE_MAX_LENGTH} characters`
    })
    secondName: string

    @ApiPropertyOptional({
        description: "Дата рождения",
        example: "2024-05-27T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    birthDate: Date
}