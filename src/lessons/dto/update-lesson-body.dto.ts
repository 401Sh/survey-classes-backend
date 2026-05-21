import { ApiPropertyOptional, PartialType } from "@nestjs/swagger"
import { CreateLessonBodyDto } from "./create-lesson-body.dto"
import { Transform, Type } from "class-transformer"
import { IsBoolean, IsEnum, IsInt, IsOptional } from "class-validator"
import { EnrollmentMode } from "../enums/enrollment-mode.enum"

export class UpdateLessonBodyDto extends PartialType(CreateLessonBodyDto) {
    @ApiPropertyOptional({
        description: "Доступно ли занятие для пользователей",
        example: true,
        type: Boolean,
    })
    @Transform(({ value }) => {
        if (value === "true") return true
        if (value === "false") return false
        return value
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean

    @ApiPropertyOptional({
        description: "Минимальный возраст ребенка",
        example: 45,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    minAge?: number

    @ApiPropertyOptional({
        description: `Принцип одобрения записей на занятие. Принятия всех заявок - AUTO, ручное одобрение - MANUAL.
            Автоматическое принятие заявок работает только для занятий, не требующих заполнения опроса для записи`,
        example: EnrollmentMode.AUTO,
        enum: EnrollmentMode,
    })
    @IsEnum(EnrollmentMode)
    @IsOptional()
    enrollmentMode?: EnrollmentMode
}