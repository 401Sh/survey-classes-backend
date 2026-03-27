import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { CreateApplicationBodyDto } from "../dto/create-application-body.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { ApplicationEntity } from "../entities/application.entity"
import { In, Not, Repository } from "typeorm"
import { AnswerEntity } from "../entities/answer.entity"
import { ApplicationStatus } from "../enums/application-status.enum"
import { LessonPricingTierEntity } from "src/lessons/entities/lesson-pricing-tier.entity"
import { UserChildEntity } from "src/users/entities/user-child.entity"
import { SortDirection } from "src/common/enums/sort-direction.enum"

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
        const pricingTier = await this.pricingTierRepository.findOne({
            where: {
                id: data.pricingTierId,
                lesson: { id: data.lessonId },
                isActive: true,
            },
        })

        if (!pricingTier) throw new NotFoundException("Pricing tier not found")

        // check that the child belongs to the user
        const child = await this.childRepository.findOne({
            where: {
                id: data.childId,
                user: { id: userId },
            },
        })

        if (!child) throw new NotFoundException("Child not found")

        // check application duplication for this lesson for this child
        const existingApplication = await this.applicationRepository.findOne({
            where: {
                createdBy: { id: userId },
                createdFor: { id: data.childId },
                survey: {
                    lesson: {
                        id: data.lessonId,
                    },
                },
                status: Not(In([
                    ApplicationStatus.CANCELLED,
                    ApplicationStatus.REJECTED,
                ])),
            },
        })

        if (existingApplication) {
            throw new BadRequestException("Application for this child and lesson already exists")
        }

        const application = await this.applicationRepository.manager.transaction(async (manager) => {
            const application = await manager.save(ApplicationEntity,
                {
                    consentedAt: data.consentedAt,
                    createdBy: { id: userId },
                    createdFor: { id: data.childId },
                    lesson: { id: data.lessonId },
                    pricingTier: { id: data.pricingTierId },
                    survey: { lesson: { id: data.lessonId } },
                }
            )

            const answers = data.answers.map(answer => ({
                question: { id: answer.questionId },
                selectedOption: answer.selectedOptionId ? { id: answer.selectedOptionId } : undefined,
                textValue: answer.textValue,
                response: { id: application.id },
            }))

            await manager.save(AnswerEntity, answers)

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
}