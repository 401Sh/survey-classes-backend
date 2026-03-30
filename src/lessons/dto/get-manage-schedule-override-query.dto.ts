import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional } from "class-validator"
import { ScheduleOverrideStatus } from "../enums/schedule-override-status.enum"
import { GetScheduleOverrideQueryDto } from "./get-schedule-override-query.dto"

export class GetManageScheduleOverrideQueryDto extends GetScheduleOverrideQueryDto {
    @ApiPropertyOptional({
        description: "Статус занятия",
        example: ScheduleOverrideStatus.CANCELLED,
        enum: ScheduleOverrideStatus,
    })
    @IsEnum(ScheduleOverrideStatus)
    @IsOptional()
    status?: ScheduleOverrideStatus
}