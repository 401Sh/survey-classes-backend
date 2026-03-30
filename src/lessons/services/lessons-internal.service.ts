import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { LessonEntity } from "../entities/lesson.entity"

@Injectable()
export class LessonsInternalService {
    private readonly logger = new Logger(LessonsInternalService.name)

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

    async findSimplefiedWithSurvey(id: number) {
        const lesson = await this.lessonRepository.findOne({
            where: {
                id,
                isActive: true,
            },
            select: {
                id: true,
                enrollmentMode: true,
                requiresSurvey: true,
                survey: {
                    id: true,
                },
            },
            relations: { survey: true },
        })
    
        if (!lesson) {
            throw new NotFoundException(`Lesson with id ${id} not found`)
        }

        return lesson
    }


    async updateSurveyRequirement(id: number, requiresSurvey: boolean) {
        const result = await this.lessonRepository.update(id, { requiresSurvey: requiresSurvey })

        if (result.affected === 0) {
            throw new NotFoundException(`Lesson with id ${id} not found`)
        }
    }
}