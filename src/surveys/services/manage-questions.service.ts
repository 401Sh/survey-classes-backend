import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { QuestionEntity } from "../entities/question.entity"
import { Repository } from "typeorm"
import { UpdateQuestionBodyDto } from "../dto/update-question-body.dto"
import { CreateQuestionOptionBodyDto } from "../dto/create-question-option-body.dto"
import { QuestionOptionEntity } from "../entities/question-option.entity"

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
        const isQuestionExists = await this.existsById(questionId)
        if (!isQuestionExists) throw new NotFoundException(`Question with id ${questionId} not found`)

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

        const option = await this.questionRepository.save({
            data,
            position,
            question: { id: questionId },
        })

        this.logger.log(`Created new option for question: ${questionId}`)
        this.logger.debug("Created new option: ", option)
        return option
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
    
            // updating question
            const updatedQuestion = await manager.update(
                QuestionEntity,
                { id: questionId },
                data,
            )

            this.logger.log(`Updated question with id: ${questionId}`)
            return updatedQuestion
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