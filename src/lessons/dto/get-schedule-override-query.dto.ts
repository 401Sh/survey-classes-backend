import { IsEnum, IsOptional } from "class-validator"
import { ScheduleOverrideStatus } from "../enums/schedule-override-status.enum"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class GetScheduleOverrideQueryDto {
    @ApiPropertyOptional({
        description: "Статус занятия",
        example: ScheduleOverrideStatus.CANCELLED,
        enum: ScheduleOverrideStatus,
    })
    @IsEnum(ScheduleOverrideStatus)
    @IsOptional()
    status: ScheduleOverrideStatus
}