import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"

export interface LessonSchedules {
    weeklySlots: LessonWeeklySlotEntity[]
    overrides: LessonScheduleOverrideEntity[]
}