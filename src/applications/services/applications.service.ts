import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { CreateApplicationBodyDto } from "../dto/create-application-body.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { ApplicationEntity } from "../entities/application.entity"
import { In, Not, Repository } from "typeorm"
import { AnswerEntity } from "../entities/answer.entity"
import { ApplicationStatus } from "../enums/application-status.enum"

@Injectable()
export class ApplicationsService {
    private readonly logger = new Logger(ApplicationsService.name)

    constructor(
        @InjectRepository(ApplicationEntity)
        private applicationRepository: Repository<ApplicationEntity>,
    ) {}

    async create(userId: number, data: CreateApplicationBodyDto) {
        const existingApplication = await this.applicationRepository.findOne({
            where: {
                createdBy: { id: userId },
                createdFor: { id: data.childId },
                survey: {
                    lesson: {
                        id: data.lessonId,
                    },
                },
                status: Not(In([ApplicationStatus.CANCELLED, ApplicationStatus.REJECTED])),
            },
        })
    
        if (existingApplication) {
            throw new BadRequestException("Application for this child and lesson already exists")
        }
    
        await this.applicationRepository.manager.transaction(async (manager) => {
            const application = await manager.save(ApplicationEntity, {
                consentedAt: data.consentedAt,
                createdBy: { id: userId },
                createdFor: { id: data.childId },
                survey: { lesson: { id: data.lessonId } },
            })
    
            const answers = data.answers.map(answer => ({
                question: { id: answer.questionId },
                selectedOption: answer.selectedOptionId ? { id: answer.selectedOptionId } : undefined,
                textValue: answer.textValue,
                response: { id: application.id },
            }))
    
            await manager.save(AnswerEntity, answers)
        })
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
                },
                survey: {
                    id: true,
                    title: true,
                },
            },
            relations: {
                createdFor: true,
                survey: true,
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
                survey: {
                    id: true,
                    title: true,
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
                survey: true,
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
    
        if (application.status === ApplicationStatus.APPROVED) {
            throw new BadRequestException("Cannot cancel approved application")
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