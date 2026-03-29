import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { CreateApplicationBodyDto } from "../dto/create-application-body.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { ApplicationEntity } from "../entities/application.entity"
import { DeepPartial, EntityManager, In, Not, Repository } from "typeorm"
import { AnswerEntity } from "../entities/answer.entity"
import { ApplicationStatus } from "../enums/application-status.enum"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { QuestionEntity } from "src/surveys/entities/question.entity"
import { CreateAnswerBodyDto } from "../dto/create-answer-body.dto"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { UpdateApplicationBodyDto } from "../dto/update-application-body.dto"

@Injectable()
export class ApplicationsService {
    private readonly logger = new Logger(ApplicationsService.name)

    constructor(
        @InjectRepository(ApplicationEntity)
        private applicationRepository: Repository<ApplicationEntity>,
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
    ) {}

    async create(userId: number, data: CreateApplicationBodyDto) {
        const { enrollmentId, answers } = data

        // check that the enrollment belongs to the user
        const enrollment = await this.getEnrollmentOrThrow(userId, enrollmentId)
        const surveyId = enrollment.lesson.survey.id

        // check cancelled application
        await this.validateApplicationNotExists(enrollmentId)

        const application = await this.applicationRepository.manager.transaction(async (manager) => {
            const application = await manager.save(ApplicationEntity,
                {
                    survey: { id: surveyId },
                    enrollment: { id: enrollmentId },
                }
            )

            await this.saveAnswers(manager, application, answers, surveyId)

            return application
        })

        this.logger.log(`Created survey ${surveyId} application for enrollment id: ${enrollmentId}`)
        this.logger.debug("Created application", application)
        return application
    }


    // TODO: add sorting queries
    async findAll(userId: number) {
        const applications = await this.applicationRepository.find({
            where: {
                enrollment: {
                    user: { id: userId },
                },
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                enrollment: {
                    child: {
                        id: true,
                        firstName: true,
                        secondName: true,
                        birthDate: true,
                    },
                    lesson: {
                        id: true,
                        name: true,
                    },
                },
            },
            relations: {
                enrollment: {
                    child: true,
                    lesson: true,
                },
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
                enrollment: {
                    user: { id: userId },
                },
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                enrollment: {
                    child: {
                        id: true,
                        firstName: true,
                        secondName: true,
                        birthDate: true,
                    },
                    lesson: {
                        id: true,
                        name: true,
                    },
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
                enrollment: {
                    child: true,
                    lesson: true,
                },
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


    async update(userId: number, applicationId: number, data: UpdateApplicationBodyDto) {
        const { answers } = data

        const application = await this.applicationRepository.findOne({
            where: {
                id: applicationId,
                enrollment: {
                    user: { id: userId },
                },
                status: ApplicationStatus.PENDING,
            },
            relations: {
                answers: true,
                survey: true,
            },
        })
    
        if (!application) throw new NotFoundException("Application not found or already approved")

        await this.applicationRepository.manager.transaction(async (manager) => {
            await manager.delete(AnswerEntity,
                {
                    response: { id: applicationId },
                },
            )

            const surveyId = application.survey.id
            await this.saveAnswers(manager, application, answers, surveyId)

            this.logger.log(`Updated answers for application with id: ${applicationId}`)
        })
    }


    private async getEnrollmentOrThrow(userId: number, enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: {
                id: enrollmentId,
                user: { id: userId },
            },
            relations: {
                lesson: { survey: true },
            },
        })

        if (!enrollment) throw new NotFoundException("Enrollment not found")

        if (!enrollment.lesson.requiresSurvey) {
            throw new BadRequestException("This lesson does not require a survey")
        }

        const survey = enrollment.lesson.survey
        if (!survey?.isActive) {
            throw new BadRequestException("No active survey found for this lesson")
        }

        return enrollment
    }


    private async validateApplicationNotExists(enrollmentId: number) {
        const isBlocked = await this.applicationRepository.exists({
            where: {
                enrollment: { id: enrollmentId },
            },
        })

        if (isBlocked) {
            throw new BadRequestException(
                "Application already exists for this enrollment. Create a new enrollment to resubmit"
            )
        }
    }


    private async saveAnswers(
        manager: EntityManager,
        application: ApplicationEntity,
        answers: CreateAnswerBodyDto[],
        surveyId: number,
    ) {
        const questionIds = answers.map(a => a.questionId)
    
        const questions = await manager.find(QuestionEntity, {
            where: {
                id: In(questionIds),
                survey: { id: surveyId },
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