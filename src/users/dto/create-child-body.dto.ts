import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDate, IsOptional, IsString, MaxLength } from "class-validator"
import { LABEL_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class CreateChildBodyDto {
    @ApiProperty({
        description: "Имя ребенка",
        example: "Adam",
        type: String,
    })
    @IsString()
    @MaxLength(LABEL_MAX_LENGTH, {
        message: `FirstName must be at most ${LABEL_MAX_LENGTH} characters`
    })
    firstName: string

    @ApiPropertyOptional({
        description: "Фамилия ребенка",
        example: "Smith",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(LABEL_MAX_LENGTH, {
        message: `SecondName must be at most ${LABEL_MAX_LENGTH} characters`
    })
    secondName: string

    @ApiProperty({
        description: "Дата рождения",
        example: "2024-05-27T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    birthDate: Date
}