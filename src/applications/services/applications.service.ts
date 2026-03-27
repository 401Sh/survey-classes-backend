import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { CreateApplicationBodyDto } from "../dto/create-application-body.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { ApplicationEntity } from "../entities/application.entity"
import { DeepPartial, EntityManager, In, Not, Repository } from "typeorm"
import { AnswerEntity } from "../entities/answer.entity"
import { ApplicationStatus } from "../enums/application-status.enum"
import { LessonPricingTierEntity } from "src/lessons/entities/lesson-pricing-tier.entity"
import { UserChildEntity } from "src/users/entities/user-child.entity"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { QuestionEntity } from "src/surveys/entities/question.entity"
import { CreateAnswerBodyDto } from "../dto/create-answer-body.dto"

@Injectable()
export class ApplicationsService {
    private readonly logger = new Logger(ApplicationsService.name)

    constructor(
        @InjectRepository(ApplicationEntity)
        private applicationRepository: Repository<ApplicationEntity>,
        @InjectRepository(LessonPricingTierEntity)
        private pricingTierRepository: Repository<LessonPricingTierEntity>,
        @InjectRepository(UserChildEntity)
        private childRepository: Repository<UserChildEntity>,
    ) {}

    async create(userId: number, data: CreateApplicationBodyDto) {
        // check that the pricing tier belongs to the activity and is active
        await this.validatePricingTier(data.pricingTierId, data.lessonId)
        // check that the child belongs to the user
        await this.validateChild(data.childId, userId)
        // check application duplication for this lesson for this child
        await this.validateDuplicateApplication(data.childId, data.lessonId)

        const application = await this.applicationRepository.manager.transaction(async (manager) => {
            const application = await manager.save(ApplicationEntity,
                {
                    consentedAt: data.consentedAt,
                    createdBy: { id: userId },
                    createdFor: { id: data.childId },
                    lesson: { id: data.lessonId },
                    pricingTier: { id: data.pricingTierId },
                    survey: {
                        lesson: { id: data.lessonId },
                    },
                }
            )

            await this.saveAnswers(manager, application, data.answers, data.lessonId)

            return application
        })

        this.logger.log(`Created child ${data.childId} application for lesson id: ${data.lessonId}`)
        this.logger.debug("Created application", application)
        return application
    }


    // TODO: add sorting queries
    async findAll(userId: number) {
        const applications = await this.applicationRepository.find({
            where: {
                createdBy: { id: userId },
            },
            select: {
                id: true,
                status: true,
                consentedAt: true,
                createdAt: true,
                createdFor: {
                    id: true,
                    firstName: true,
                    secondName: true,
                    birthDate: true,
                },
                lesson: {
                    id: true,
                    name: true,
                },
                pricingTier: {
                    id: true,
                    label: true,
                    price: true,
                    sessionsCount: true,
                },
            },
            relations: {
                createdFor: true,
                lesson: true,
                pricingTier: true,
            },
            order: {
                createdAt: SortDirection.DESC,
            },
        })

        this.logger.debug("Get application list: ", applications)
        return applications
    }


    async findById(userId: number, applicationId: number) {
        const application = await this.applicationRepository.findOne({
            where: {
                id: applicationId,
                createdBy: { id: userId },
            },
            select: {
                id: true,
                status: true,
                consentedAt: true,
                createdAt: true,
                createdFor: {
                    id: true,
                    firstName: true,
                    secondName: true,
                    birthDate: true,
                },
                lesson: {
                    id: true,
                    name: true,
                },
                pricingTier: {
                    id: true,
                    label: true,
                    price: true,
                    sessionsCount: true,
                },
                answers: {
                    id: true,
                    textValue: true,
                    question: {
                        id: true,
                        label: true,
                        type: true,
                    },
                    selectedOption: {
                        id: true,
                        label: true,
                    },
                },
            },
            relations: {
                createdFor: true,
                lesson: true,
                pricingTier: true,
                answers: {
                    question: true,
                    selectedOption: true,
                },
            },
        })

        if (!application) throw new NotFoundException("Application not found")

        this.logger.log(`Finded application with id: ${application.id}`)
        this.logger.debug("Get application: ", application)
        return application
    }


    async cancel(userId: number, applicationId: number) {
        const application = await this.applicationRepository.findOne({
            where: {
                id: applicationId,
                createdBy: { id: userId },
            },
        })

        if (!application) throw new NotFoundException("Application not found")

        if (application.status !== ApplicationStatus.PENDING) {
            throw new BadRequestException("Only pending applications can be cancelled")
        }

        const updateResult = await this.applicationRepository.update(
            { id: applicationId },
            { status: ApplicationStatus.CANCELLED },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update application with id: ${applicationId}`)
            throw new NotFoundException(`Application with id ${applicationId} not found`)
        }

        this.logger.log(`Application with id ${application.id} status changed successfully`)
        return updateResult
    }


    private async validatePricingTier(tierId: number, lessonId: number) {
        const tier = await this.pricingTierRepository.findOne({
            where: {
                id: tierId,
                lesson: { id: lessonId },
                isActive: true,
            },
        })

        if (!tier) throw new NotFoundException("Pricing tier not found")
    }


    private async validateChild(childId: number, userId: number) {
        const child = await this.childRepository.findOne({
            where: {
                id: childId,
                user: { id: userId },
            },
        })

        if (!child) throw new NotFoundException("Child not found")
    }


    private async validateDuplicateApplication(childId: number, lessonId: number) {
        const existing = await this.applicationRepository.findOne({
            where: {
                createdFor: { id: childId },
                lesson: { id: lessonId },
                status: Not(In([
                    ApplicationStatus.CANCELLED,
                    ApplicationStatus.REJECTED,
                ])),
            },
        })

        if (existing) throw new BadRequestException("Application for this child and lesson already exists")
    }


    private async saveAnswers(
        manager: EntityManager,
        application: ApplicationEntity,
        answers: CreateAnswerBodyDto[],
        lessonId: number,
    ) {
        const questionIds = answers.map(a => a.questionId)
    
        const questions = await manager.find(QuestionEntity, {
            where: {
                id: In(questionIds),
                survey: {
                    lesson: { id: lessonId },
                },
            },
            relations: { options: true },
        })

        if (questions.length !== questionIds.length) {
            throw new BadRequestException("Invalid questions for this survey")
        }

        const questionMap = new Map(questions.map(q => [q.id, q]))

        const answerEntities = answers.flatMap<DeepPartial<AnswerEntity>>(answer => {
            // a dangerous decision, but previous checks should have ruled out the possibility of an error occurring
            const question = questionMap.get(answer.questionId)! // danger

            // for checkbox/radio — one Answer for each selected option
            if (answer.selectedOptionIds?.length) {
                // validation that the options belong to the question
                const validOptionIds = new Set(question.options.map(o => o.id))
                const invalidOptions = answer.selectedOptionIds.filter(id => !validOptionIds.has(id))

                if (invalidOptions.length) {
                    throw new BadRequestException(`Invalid options ${invalidOptions} for question ${question.id}`)
                }

                return answer.selectedOptionIds.map(optionId => ({
                    question,
                    selectedOption: { id: optionId },
                    response: application,
                }))
            }

            // для text — одна Answer с textValue
            return [{
                question,
                textValue: answer.textValue,
                response: application,
            }]
        })

        await manager.save(AnswerEntity, answerEntities)
    }
}