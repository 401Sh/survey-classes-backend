import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { CreateApplicationBodyDto } from "../dto/create-application-body.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { ApplicationEntity } from "../entities/application.entity"
import { DeepPartial, EntityManager, In, Not, Repository } from "typeorm"
import { AnswerEntity } from "../entities/answer.entity"
import { ApplicationStatus, FINAL_STATUSES, REAPPLICABLE_STATUSES } from "../enums/application-status.enum"
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
        const { lessonId, childId, consentedAt, pricingTierId, answers } = data

        // check blocked application
        await this.validateNotBlocked(lessonId, childId)
        // check re-application
        const answersLength = answers.length
        await this.validateReapplication(lessonId, childId, answersLength)
        // check that the pricing tier belongs to the activity and is active
        await this.validatePricingTier(lessonId, pricingTierId)
        // check that the child belongs to the user
        await this.validateChild(childId, userId)
        // check application duplication for this lesson for this child
        await this.validateDuplicateApplication(lessonId, childId)

        const application = await this.applicationRepository.manager.transaction(async (manager) => {
            const application = await manager.save(ApplicationEntity,
                {
                    consentedAt: consentedAt,
                    createdBy: { id: userId },
                    createdFor: { id: childId },
                    lesson: { id: lessonId },
                    pricingTier: { id: pricingTierId },
                    survey: {
                        lesson: { id: lessonId },
                    },
                }
            )

            await this.saveAnswers(manager, application, answers, lessonId)

            return application
        })

        this.logger.log(`Created child ${childId} application for lesson id: ${lessonId}`)
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


    private async validateNotBlocked(lessonId: number, childId: number) {
        const isBlocked = await this.applicationRepository.exists({
            where: {
                createdFor: { id: childId },
                lesson: { id: lessonId },
                status: ApplicationStatus.BLOCKED,
            },
        })
    
        if (isBlocked) {
            throw new BadRequestException("Application is blocked. You cannot apply again")
        }
    }


    private async validateReapplication(lessonId: number, childId: number, answersLength: number) {
        const isCompletedSurveyBefore = await this.applicationRepository.exists({
            where: {
                createdFor: { id: childId },
                lesson: { id: lessonId },
                status: In(REAPPLICABLE_STATUSES),
            },
        })

        if (!isCompletedSurveyBefore && answersLength === 0) {
            throw new BadRequestException("Survey answers are required for first application")
        }
    }


    private async validatePricingTier(lessonId: number, tierId: number) {
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


    private async validateDuplicateApplication(lessonId: number, childId: number) {
        const isApplicationExists = await this.applicationRepository.exists({
            where: {
                createdFor: { id: childId },
                lesson: { id: lessonId },
                status: Not(In(FINAL_STATUSES)),
            },
        })

        if (isApplicationExists) throw new BadRequestException("Application for this child and lesson already exists")
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