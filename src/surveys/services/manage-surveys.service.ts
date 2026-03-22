import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { UpdateSurveyBodyDto } from "../dto/update-survey-body.dto"
import { GetSurveyListQueryDto } from "../dto/get-survey-list-query.dto"
import { CopySurveyBodyDto } from "../dto/copy-survey-body.dto"
import { CreateSurveyBodyDto } from "../dto/create-survey-body.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { SurveyEntity } from "../entities/survey.entity"
import { Repository } from "typeorm"
import { LessonsService } from "src/lessons/services/lessons.service"
import { CreateQuestionBodyDto } from "../dto/create-question-body.dto"
import { QuestionEntity } from "../entities/question.entity"
import { SortDirection } from "src/common/enums/sort-direction.enum"

@Injectable()
export class ManageSurveysService {
    private readonly logger = new Logger(ManageSurveysService.name)

    constructor(
        @InjectRepository(SurveyEntity)
        private surveyRepository: Repository<SurveyEntity>,
        @InjectRepository(QuestionEntity)
        private questionRepository: Repository<QuestionEntity>,

        private lessonsService: LessonsService,
    ) {}

    async create(userId: number, data: CreateSurveyBodyDto) {
        const { lessonId, ...otherData } = data

        if (lessonId) {
            const isLessonExists = await this.lessonsService.existsById(lessonId)
            if (!isLessonExists) throw new NotFoundException(`Lesson with id ${lessonId} not found`)
        }

        const survey = await this.surveyRepository.save({
            ...otherData,
            createdBy: { id: userId },
            lesson: lessonId ? { id: lessonId } : undefined,
        })

        this.logger.log(`Created new survey for user: ${userId}`)
        this.logger.debug("Created new survey: ", survey)
        return survey
    }


    async createQuestion(surveyId: number, data: CreateQuestionBodyDto) {
        const isSurveyExists = await this.existsById(surveyId)
        if (!isSurveyExists) throw new NotFoundException(`Survey with id ${surveyId} not found`)

        const lastQuestion = await this.questionRepository.findOne({
            where: {
                survey: {
                    id: surveyId,
                },
            },
            order: {
                position: SortDirection.DESC,
            },
        })

        const position = lastQuestion ? lastQuestion.position + 1 : 1

        const question = await this.questionRepository.save({
            ...data,
            position,
            survey: { id: surveyId },
        })

        this.logger.log(`Created new question for survey: ${surveyId}`)
        this.logger.debug("Created new question: ", question)
        return question
    }


    async copy(surveyId: number, data: CopySurveyBodyDto) {
        const survey = await this.surveyRepository.findOne({
            where: { id: surveyId },
            relations: {
                questions: {
                    options: true
                },
            },
        })
    
        if (!survey) throw new NotFoundException(`Survey with id ${surveyId} not found`)
    
        if (data.lessonId) {
            const lessonExists = await this.lessonsService.existsById(data.lessonId)
            if (!lessonExists) throw new NotFoundException(`Lesson with id ${data.lessonId} not found`)
        }
    
        const newSurvey = await this.surveyRepository.save({
            title: survey.title,
            description: survey.description,
            isActive: false,
            lesson: data.lessonId ? { id: data.lessonId } : undefined,
            createdBy: survey.createdBy,
            questions: survey.questions.map(question => ({
                label: question.label,
                description: question.description,
                type: question.type,
                position: question.position,
                options: question.options.map(option => ({
                    label: option.label,
                    position: option.position,
                }))
            }))
        })
    
        this.logger.log(`Copied survey ${surveyId} to lesson ${data.lessonId}`)
        return newSurvey
    }


    async findAll(query: GetSurveyListQueryDto) {
        const { limit, page, dateFrom, dateTo, isActive, sortDirection } = query

        const queryBuilder = this.surveyRepository.createQueryBuilder("surveys")

        queryBuilder.leftJoinAndSelect("surveys.questions", "questions")
        queryBuilder.leftJoinAndSelect("questions.options", "options")

        if (isActive) {
            queryBuilder.where("surveys.isActive = :isActive", { isActive })
        }

        if (dateFrom) {
            queryBuilder.andWhere("surveys.createdAt >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("surveys.createdAt <= :dateTo", { dateTo })
        }

        queryBuilder.orderBy("surveys.createdAt", sortDirection)
        queryBuilder.skip((page - 1) * limit).take(limit)

        const [surveys, totalCount] = await queryBuilder.getManyAndCount()
        const totalPagesAmount = Math.ceil(totalCount / limit)

        this.logger.debug('Get survey list: ', surveys)
        return {
            data: surveys,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: page,
            },
        }
    }


    async findById(id: number): Promise<SurveyEntity> {
        const survey = await this.surveyRepository.findOne({
            where: { id },
            relations: {
                questions: {
                    options: true,
                },
            },
        })
        
        if (!survey) {
            this.logger.log(`No survey with id: ${id}`)
            throw new NotFoundException(`Survey with id ${id} not found`)
        }
    
        this.logger.log(`Finded survey with id: ${id}`)
        this.logger.debug('Get survey: ', survey)
        return survey
    }


    async findAllQuestionsBySurveyId(surveyId: number) {
        const surveyExists = await this.existsById(surveyId)
        if (!surveyExists) throw new NotFoundException(`Survey with id ${surveyExists} not found`)

        const questions = await this.questionRepository.find({
            where: {
                survey: {
                    id: surveyId,
                },
            },
            relations: {
                options: true,
            },
        })

        this.logger.log(`Finded questions for survey with id: ${surveyId}`)
        this.logger.debug('Get questions list: ', questions)
        return questions
    }


    async existsById(id: number): Promise<boolean> {
        return this.surveyRepository.existsBy({ id })
    }


    async update(surveyId: number, data: UpdateSurveyBodyDto) {
        const survey = await this.surveyRepository.findOne({
            where: { id: surveyId }
        })
        if (!survey) throw new NotFoundException(`Survey with id ${surveyId} not found`)
    
        const { lessonId, ...otherData } = data

        if (lessonId) {
            const isSurveyExists = await this.lessonsService.existsById(surveyId)
            if (!isSurveyExists) throw new NotFoundException(`Survey with id ${surveyId} not found`)

            // untying current survey from lesson
            await this.surveyRepository.update(
                {
                    lesson: {
                        id: lessonId,
                    },
                },
                {
                    lesson: undefined,
                },
            )
        }
        
        const updateResult = await this.surveyRepository.update(
            {
                id: surveyId,
            },
            {
                ...otherData,
                lesson: lessonId ? { id: lessonId } : undefined,
            },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update survey with id: ${surveyId}`)
            throw new NotFoundException(`Survey with id ${surveyId} not found`)
        }

        this.logger.log(`Survey with id ${surveyId} updated successfully`)
        return updateResult
    }


    async delete(surveyId: number) {
        this.logger.log(`Deleting survey with id: ${surveyId}`)
        const deleteResult = await this.surveyRepository.delete({ id: surveyId })

        if (deleteResult.affected === 0) {
            this.logger.log(`Cannot delete survey. No survey with id: ${surveyId}`)
            throw new NotFoundException(`Survey with id ${surveyId} not found`)
        }

        return deleteResult
    }
}