import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { ScheduleOverrideStatus } from "../enums/schedule-override-status.enum"

export type ScheduleOverrideFilters = {
    dateFrom?: Date,
    dateTo?: Date,
    status?: ScheduleOverrideStatus,
}

export type CreateScheduleOverrideData = {
    date: Date,
    status: ScheduleOverrideStatus,
    startTime?: string,
    address?: string,
    note?: string,
}

export type ScheduleOverrideData = Partial<CreateScheduleOverrideData>

export abstract class ScheduleOverrideRepository {
    // public
    abstract findPublicByLessonId(
        lessonId: number,
        dateFrom?: Date,
        dateTo?: Date,
    ):Promise<LessonScheduleOverrideEntity[]>

    // manage
    abstract create(lessonId: number, data: CreateScheduleOverrideData): Promise<LessonScheduleOverrideEntity>
    abstract findById(id: number): Promise<LessonScheduleOverrideEntity | null>
    abstract findAllByLessonId(
        lessonId: number,
        filters: ScheduleOverrideFilters,
    ): Promise<LessonScheduleOverrideEntity[]>
    abstract update(id: number, data: ScheduleOverrideData): Promise<boolean>
    abstract delete(id: number): Promise<boolean>
}