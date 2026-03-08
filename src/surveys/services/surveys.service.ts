import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { GetSurveyByLessonQueryDto } from "../dto/get-survey-by-lesson-query.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { SurveyEntity } from "../entities/survey.entity"
import { Repository } from "typeorm"
import { LessonsService } from "src/lessons/lessons.service"

@Injectable()
export class SurveysService {
    private readonly logger = new Logger(SurveysService.name)

    constructor(
        @InjectRepository(SurveyEntity)
        private surveyRepository: Repository<SurveyEntity>,

        private lessonsService: LessonsService,
    ) {}


    async findByLessonId(query: GetSurveyByLessonQueryDto) {
        const isLessonExists = await this.lessonsService.existsById(query.lessonId)
        if (!isLessonExists) throw new NotFoundException(`Lesson with id ${query.lessonId} not found`)
        
        const survey = await this.surveyRepository.findOne({
            where: {
                isActive: true,
                lesson: {
                    id: query.lessonId,
                },
            },
            relations: {
                questions: {
                    options: true,
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                questions: {
                    id: true,
                    label: true,
                    description: true,
                    type: true,
                    position: true,
                    options: {
                        id: true,
                        label: true,
                        position: true,
                    },
                },
            },
        })
        
        if (!survey) {
            this.logger.log(`No survey for lesson with id: ${query.lessonId}`)
            throw new NotFoundException(`Survey for lesson with id ${query.lessonId} not found`)
        }
    
        this.logger.log(`Finded survey for lesson with id: ${query.lessonId}`)
        return survey
    }
}