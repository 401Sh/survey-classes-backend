import { UpdateScheduleOverrideBodyDto } from "../dto/update-schedule-override-body.dto"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"

export interface IManageScheduleOverridesService {
    findById(id: number): Promise<LessonScheduleOverrideEntity>
    update(overrideId: number, data: UpdateScheduleOverrideBodyDto): Promise<void>
    delete(overrideId: number): Promise<void>
}