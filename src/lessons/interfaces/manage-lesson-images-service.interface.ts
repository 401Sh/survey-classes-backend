import { LessonImageEntity } from "../entities/lesson-image.entity"

export interface IManageLessonImagesService {
    uploadImage(lessonId: number, file: Express.Multer.File): Promise<LessonImageEntity>
    findAll(lessonId: number): Promise<LessonImageEntity[]>
    setCover(lessonId: number, imageId: number): Promise<void>
    remove(lessonId: number, imageId: number): Promise<void>
}