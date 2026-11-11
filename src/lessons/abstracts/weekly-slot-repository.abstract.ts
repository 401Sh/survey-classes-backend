import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"

export type WeeklySlotListFilters = {
    isActive?: boolean,
    daysOfWeek?: number[],
}

export type WeeklySlotData = {
    startTime: string,
    durationMinutes: number,
    address: string,
    isActive: boolean,
}

export abstract class WeeklySlotRepository {
    // public
    abstract findActiveByLessonId(lessonId: number): Promise<LessonWeeklySlotEntity[]>

    // manage
    abstract findById(id: number): Promise<LessonWeeklySlotEntity | null>
    abstract findByIdWithLesson(id: number): Promise<LessonWeeklySlotEntity | null>
    abstract findAllByLessonId(lessonId: number, filters: WeeklySlotListFilters): Promise<LessonWeeklySlotEntity[]>
    abstract findDuplicates(
        lessonId: number,
        daysOfWeek: number[],
        startTime: string,
    ): Promise<LessonWeeklySlotEntity[]>
    abstract save(data: LessonWeeklySlotEntity): Promise<LessonWeeklySlotEntity>
    abstract createMany(
        lessonId: number,
        data: WeeklySlotData,
        daysOfWeek: number[],
    ): Promise<LessonWeeklySlotEntity[]>
    abstract delete(id: number): Promise<boolean>
}