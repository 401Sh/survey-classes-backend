import { LessonImageEntity } from "../entities/lesson-image.entity"

export abstract class LessonImageRepository {
    abstract create(lessonId: number, path: string, position: number): Promise<LessonImageEntity>
    abstract findByIdAndLessonId(id: number, lessonId: number): Promise<LessonImageEntity | null>
    abstract findLastByLessonId(lessonId: number): Promise<LessonImageEntity | null>
    abstract findAllByLessonId(lessonId: number): Promise<LessonImageEntity[]>
    abstract deleteAndReorder(id: number, lessonId: number): Promise<void>
}