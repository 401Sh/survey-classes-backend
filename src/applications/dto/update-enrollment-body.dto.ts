import { IsEnum } from "class-validator"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateEnrollmentBodyDto {
    @ApiProperty({
        description: "Статус записи на занятие",
        example: EnrollmentStatus.SUSPENDED,
        enum: EnrollmentStatus,
    })
    @IsEnum(EnrollmentStatus)
    status: EnrollmentStatus
}