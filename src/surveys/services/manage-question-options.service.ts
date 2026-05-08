import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { QuestionOptionEntity } from "../entities/question-option.entity"
import { Repository } from "typeorm"
import { UpdateQuestionOptionBodyDto } from "../dto/update-question-option-body.dto"
import { IManageQuestionOptionsService } from "../interfaces/manage-question-options-service.interface"

@Injectable()
export class ManageQuestionOptionsService implements IManageQuestionOptionsService {
    private readonly logger = new Logger(ManageQuestionOptionsService.name)

    constructor(
        @InjectRepository(QuestionOptionEntity)
        private questionOptionsRepository: Repository<QuestionOptionEntity>,
    ) {}

    async findById(id: number) {
        const option = await this.questionOptionsRepository.findOne({
            where: { id },
        })

        this.logger.log(`Finded question option with id: ${id}`)
        this.logger.debug("Get question option: ", option)
        return option
    }


    async update(questionOptionId: number, data: UpdateQuestionOptionBodyDto) {
        // creating transaction
        await this.questionOptionsRepository.manager.transaction(async (manager) => {
            const option = await manager.findOne(QuestionOptionEntity,
                {
                    where: { id: questionOptionId },
                    relations: { question: true },
                },
            )
    
            if (!option) throw new NotFoundException(`Question option with id ${questionOptionId} not found`)
    
            if (data.position && data.position !== option.position) {
                // get question max position in survey
                const maxPosition = await manager.maximum(QuestionOptionEntity,
                    "position",
                    {
                        question: { id: option.question.id },
                    },
                )

                const oldPosition = option.position
                const newPosition = Math.min(data.position, maxPosition ?? data.position)

                data.position = newPosition

                if (newPosition > oldPosition) {
                    // if we move question down - other questions moving up
                    await manager.createQueryBuilder()
                        .update(QuestionOptionEntity)
                        .set({ position: () => "position - 1" })
                        .where(
                            "questionId = :questionId AND position > :oldPosition AND position <= :newPosition",
                            {
                                questionId: option.question.id,
                                oldPosition,
                                newPosition,
                            },
                        )
                        .execute()
                } else {
                    // if we move question up - other questions moving down
                    await manager.createQueryBuilder()
                        .update(QuestionOptionEntity)
                        .set({ position: () => "position + 1" })
                        .where(
                            "questionId = :questionId AND position >= :newPosition AND position < :oldPosition",
                            {
                                questionId: option.question.id,
                                newPosition,
                                oldPosition,
                            },
                        )
                        .execute()
                }
            }

            // updating question
            const updateResult =  await manager.update(QuestionOptionEntity,
                { id: questionOptionId },
                data,
            )

            if (updateResult.affected === 0) {
                this.logger.debug(`Cannot update question option with id: ${questionOptionId}`)
                throw new NotFoundException(`Question option with id ${questionOptionId} not found`)
            }

            this.logger.log(`Updated question option with id: ${questionOptionId}`)
        })
    }


    async delete(questionOptionId: number) {
        await this.questionOptionsRepository.manager.transaction(async (manager) => {
            const option = await manager.findOne(QuestionOptionEntity, {
                where: { id: questionOptionId },
                relations: { question: true },
            })

            if (!option) throw new NotFoundException(`Question option with id ${questionOptionId} not found`)

            await manager.createQueryBuilder()
                .update(QuestionOptionEntity)
                .set({ position: () => "position - 1" })
                .where(
                    "questionId = :questionId AND position > :position",
                    { questionId: option.question.id, position: option.position },
                )
                .execute()

            await manager.delete(QuestionOptionEntity, { id: questionOptionId })
        })

        this.logger.log(`Deleted question option with id: ${questionOptionId}`)
    }
}