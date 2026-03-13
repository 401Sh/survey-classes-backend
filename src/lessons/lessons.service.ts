import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { LessonEntity } from "./entities/lesson.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

@Injectable()
export class LessonsService {
    private readonly logger = new Logger(LessonsService.name)

    constructor(
        @InjectRepository(LessonEntity)
        private lessonRepository: Repository<LessonEntity>,
    ) {}

    async existsById(id: number): Promise<boolean> {
        return this.lessonRepository.existsBy({ id })
    }
    

    async findById(id: number): Promise<LessonEntity>{
        const lesson = await this.lessonRepository.findOne({
            where: { id },
            select: {
                id: true,
                name: true,
            }
        })
    
        if (!lesson) {
            this.logger.log(`No lesson with id: ${id}`)
            throw new NotFoundException(`Lesson with id ${id} not found`)
        }
    
        this.logger.log(`Finded lesson with id: ${id}`)
        return lesson
    }
}