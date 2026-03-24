import { PartialType } from "@nestjs/swagger"
import { CreateScheduleOverrideBodyDto } from "./create-schedule-override-body.dto"

export class UpdateScheduleOverrideBodyDto extends PartialType(CreateScheduleOverrideBodyDto) {}