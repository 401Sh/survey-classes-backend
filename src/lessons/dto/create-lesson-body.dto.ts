import { ArrayUnique, IsArray, IsBoolean, IsDate, IsInt, IsOptional, IsString, MaxLength } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { LABEL_MAX_LENGTH, TEXT_MAX_LENGTH } from "src/common/constants/dto-request-limits.constant"

export class CreateLessonBodyDto {
    @ApiProperty({
        description: "Название занятия",
        example: "New test lesson",
        type: String,
    })
    @IsString()
    @MaxLength(LABEL_MAX_LENGTH, {
        message: `Name must be at most ${LABEL_MAX_LENGTH} characters`
    })
    name: string

    @ApiProperty({
        description: "Количество людей на занятие",
        example: 15,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    capacity: number

    @ApiPropertyOptional({
        description: "Доступно ли занятие для пользователей",
        example: true,
        type: Boolean,
        default: false,
    })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    isActive: boolean = false

    @ApiPropertyOptional({
        description: "Описание занятия",
        example: "Some test text for lesson",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(TEXT_MAX_LENGTH, {
        message: `Description must be at most ${TEXT_MAX_LENGTH} characters`
    })
    description?: string

    @ApiPropertyOptional({
        description: "Преподаватель проводящий занятия",
        example: "John Smith",
        type: String,
    })
    @IsString()
    @IsOptional()
    @MaxLength(TEXT_MAX_LENGTH, {
        message: `Teacher string must be at most ${TEXT_MAX_LENGTH} characters`
    })
    teacher?: string

    @ApiPropertyOptional({
        description: "Дата начала курса занятия",
        example: "2026-01-27T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    startsAt?: Date
    
    @ApiPropertyOptional({
        description: "Дата окончания курса занятия",
        example: "2026-02-14T21:10:42Z",
        type: Date,
    })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    endsAt?: Date

    @ApiPropertyOptional({
        description: "Список id категорий, связанных с занятием",
        example: [1, 13, 5],
        isArray: true,
        type: () => Number,
    })
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    @Type(() => Number)
    @IsOptional()
    categoryIds: number[] = []
}