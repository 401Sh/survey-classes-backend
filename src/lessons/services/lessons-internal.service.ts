import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { LessonEntity } from "../entities/lesson.entity"
import { ILessonsInternalService } from "../interfaces/lessons-internal-service.interface"

@Injectable()
export class LessonsInternalService implements ILessonsInternalService {
    constructor(
        @InjectRepository(LessonEntity)
        private lessonRepository: Repository<LessonEntity>,
    ) {}

    async exists(id: number) {
        const isExists = await this.lessonRepository.exists({
            where: { id },
        })
    
        return isExists
    }

    async findSimplified(id: number) {
        const lesson = await this.lessonRepository.findOne({
            where: {
                id,
                isActive: true,
            },
            select: {
                id: true,
                enrollmentMode: true,
            },
        })
    
        if (!lesson) {
            throw new NotFoundException(`Lesson with id ${id} not found`)
        }

        return lesson
    }
}