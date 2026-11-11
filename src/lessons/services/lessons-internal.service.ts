import { Injectable, NotFoundException } from "@nestjs/common"
import { ILessonsInternalService } from "../interfaces/lessons-internal-service.interface"
import { LessonRepository } from "../abstracts/lesson-repository.abstract"

@Injectable()
export class LessonsInternalService implements ILessonsInternalService {
    constructor(private readonly lessonRepository: LessonRepository) {}

    async exists(id: number) {
        const isExists = await this.lessonRepository.existsById(id)
    
        return isExists
    }

    async findSimplified(id: number) {
        const lesson = await this.lessonRepository.findActiveSimplifiedById(id)
    
        if (!lesson) {
            throw new NotFoundException(`Lesson with id ${id} not found`)
        }

        return lesson
    }
}