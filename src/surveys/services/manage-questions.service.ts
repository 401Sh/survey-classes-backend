import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { QuestionEntity } from "../entities/question.entity"
import { Repository } from "typeorm"
import { UpdateQuestionBodyDto } from "../dto/update-question-body.dto"
import { CreateQuestionOptionBodyDto } from "../dto/create-question-option-body.dto"
import { QuestionOptionEntity } from "../entities/question-option.entity"
import { QuestionType } from "../enums/question-type.enum"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { IManageQuestionsService } from "../interfaces/manage-questions-service.interface"

@Injectable()
export class ManageQuestionsService implements IManageQuestionsService {
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
                position: SortDirection.DESC,
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
        this.logger.debug("Get question: ", question)
        return question
    }


    async findAllOptionsByQuestionId(questionId: number) {
        // check that question exists
        await this.validateQuestionExists(questionId)

        const options = await this.questionOptionRepository.find({
            where: {
                question: {
                    id: questionId,
                },
            },
            relations: {
                question: true,
            },
        })

        this.logger.log(`Finded question options for question with id: ${questionId}`)
        this.logger.debug("Get question options list: ", options)
        return options
    }


    async update(questionId: number, data: UpdateQuestionBodyDto) {
        // creating transaction
        await this.questionRepository.manager.transaction(async (manager) => {
            const question = await manager.findOne(QuestionEntity,
                {
                    where: { id: questionId },
                    relations: { survey: true },
                },
            )

            if (!question) throw new NotFoundException(`Question with id ${questionId} not found`)

            if (data.position && data.position !== question.position) {
                // get question max position in survey
                const maxPosition = await manager.maximum(QuestionEntity,
                    "position",
                    {
                        survey: { id: question.survey.id },
                    },
                )

                const oldPosition = question.position
                const newPosition =   Math.min(data.position, maxPosition ?? data.position)

                data.position = newPosition

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
                await manager.delete(QuestionOptionEntity,
                    {
                        question: { id: questionId },
                    },
                )
                this.logger.debug(`Deleted all options for question ${questionId} due to type change to TEXT`)
            }            
    
            // updating question
            const updateResult = await manager.update(QuestionEntity,
                { id: questionId },
                data,
            )

            if (updateResult.affected === 0) {
                this.logger.debug(`Cannot update question with id: ${questionId}`)
                throw new NotFoundException(`Question with id ${questionId} not found`)
            }

            this.logger.log(`Updated question with id: ${questionId}`)
        })
    }


    async delete(questionId: number) {
        await this.questionRepository.manager.transaction(async (manager) => {
            const question = await manager.findOne(QuestionEntity, {
                where: { id: questionId },
                relations: { survey: true },
            })

            if (!question) throw new NotFoundException(`Question with id ${questionId} not found`)

            // сдвигаем все вопросы после удаляемого вверх
            await manager.createQueryBuilder()
                .update(QuestionEntity)
                .set({ position: () => "position - 1" })
                .where(
                    "surveyId = :surveyId AND position > :position",
                    { surveyId: question.survey.id, position: question.position },
                )
                .execute()

            await manager.delete(QuestionEntity, { id: questionId })
        })

        this.logger.log(`Deleted question with id: ${questionId}`)
    }


    private async validateQuestionExists(questionId: number) {
        const isQuestionExists = await this.questionRepository.exists({
            where: { id: questionId }
        })

        if (!isQuestionExists) throw new NotFoundException(`Question with id ${questionId} not found`)
    }
}