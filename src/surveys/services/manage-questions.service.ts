import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { QuestionEntity } from "../entities/question.entity"
import { Repository } from "typeorm"
import { UpdateQuestionBodyDto } from "../dto/update-question-body.dto"
import { CreateQuestionOptionBodyDto } from "../dto/create-question-option-body.dto"
import { QuestionOptionEntity } from "../entities/question-option.entity"
import { QuestionType } from "../enums/question-type.enum"

@Injectable()
export class ManageQuestionsService {
    private readonly logger = new Logger(ManageQuestionsService.name)

    constructor(
        @InjectRepository(QuestionEntity)
        private questionRepository: Repository<QuestionEntity>,
        @InjectRepository(QuestionOptionEntity)
        private questionOptionRepository: Repository<QuestionOptionEntity>,
    ) {}

    async createQuestionOption(questionId: number, data: CreateQuestionOptionBodyDto) {
        const question = await this.questionRepository.findOne({
            where: { id: questionId }
        })
    
        if (!question) throw new NotFoundException(`Question with id ${questionId} not found`)
    
        if (question.type === QuestionType.TEXT) {
            throw new BadRequestException("Text questions cannot have options")
        }

        const lastOption = await this.questionOptionRepository.findOne({
            where: {
                question: {
                    id: questionId,
                },
            },
            order: {
                position: "DESC",
            },
        })

        const position = lastOption ? lastOption.position + 1 : 1

        const option = await this.questionOptionRepository.save({
            ...data,
            position,
            question: { id: questionId },
        })

        this.logger.log(`Created new option for question: ${questionId}`)
        this.logger.debug("Created new option: ", option)
        return option
    }


    async findById(id: number) {
        const question = await this.questionRepository.findOne({
            where: { id },
            relations: {
                options: true,
            },
        })

        this.logger.log(`Finded question with id: ${id}`)
        this.logger.debug('Get question: ', question)
        return question
    }


    async findAllOptionsByQuestionid(questionId: number) {
        const questionExists = await this.existsById(questionId)
        if (!questionExists) throw new NotFoundException(`Question with id ${questionExists} not found`)

        const options = await this.questionRepository.find({
            where: {
                survey: {
                    id: questionId,
                },
            },
            relations: {
                options: true,
            },
        })

        this.logger.log(`Finded question options for question with id: ${questionId}`)
        this.logger.debug('Get question options list: ', options)
        return options
    }


    async existsById(id: number): Promise<boolean> {
        return this.questionRepository.existsBy({ id })
    }


    async update(questionId: number, data: UpdateQuestionBodyDto) {
        // creating transaction
        await this.questionRepository.manager.transaction(async (manager) => {
            const question = await manager.findOne(
                QuestionEntity,
                {
                    where: {
                        id: questionId,
                    },
                    relations: {
                        survey: true,
                    },
                },
            )
    
            if (!question) throw new NotFoundException(`Question with id ${questionId} not found`)
    
            if (data.position && data.position !== question.position) {
                const oldPosition = question.position
                const newPosition = data.position
    
                if (newPosition > oldPosition) {
                    // if we move question down - other questions moving up
                    await manager.createQueryBuilder()
                        .update(QuestionEntity)
                        .set({ position: () => "position - 1" })
                        .where(
                            "surveyId = :surveyId AND position > :oldPosition AND position <= :newPosition",
                            {
                                surveyId: question.survey.id,
                                oldPosition,
                                newPosition,
                            },
                        )
                        .execute()
                } else {
                    // if we move question up - other questions moving down
                    await manager.createQueryBuilder()
                        .update(QuestionEntity)
                        .set({ position: () => "position + 1" })
                        .where(
                            "surveyId = :surveyId AND position >= :newPosition AND position < :oldPosition",
                            {
                                surveyId: question.survey.id,
                                newPosition,
                                oldPosition,
                            },
                        )
                        .execute()
                }
            }

            // deleting question options if type changed to TEXT
            if (data.type && data.type === QuestionType.TEXT && question.type !== QuestionType.TEXT) {
                await manager.delete(
                    QuestionOptionEntity,
                    {
                        question: {
                            id: questionId,
                        },
                    },
                )
                this.logger.debug(`Deleted all options for question ${questionId} due to type change to TEXT`)
            }            
    
            // updating question
            const updateResult = await manager.update(
                QuestionEntity,
                { id: questionId },
                data,
            )

            this.logger.log(`Updated question with id: ${questionId}`)
            return updateResult
        })
    }


    async delete(questionId: number) {
        this.logger.log(`Deleting question with id: ${questionId}`)
        const deleteResult = await this.questionRepository.delete({ id: questionId })

        if (deleteResult.affected === 0) {
            this.logger.log(`Cannot delete question. No question with id: ${questionId}`)
            throw new NotFoundException(`Question with id ${questionId} not found`)
        }

        return deleteResult
    }
}