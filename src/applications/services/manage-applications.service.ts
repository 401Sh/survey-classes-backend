import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { ApplicationEntity } from "../entities/application.entity"
import { Repository } from "typeorm"
import { GetApplicationListQueryDto } from "../dto/get-application-list-query.dto"
import { ApplicationStatus } from "../enums/application-status.enum"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"

@Injectable()
export class ManageApplicationsService {
    private readonly logger = new Logger(ManageApplicationsService.name)

    constructor(
        @InjectRepository(ApplicationEntity)
        private applicationRepository: Repository<ApplicationEntity>,
    ) {}

    async findAll(query: GetApplicationListQueryDto) {
        const { limit, page, dateFrom, dateTo, status, lessonId, createdBy, createdFor, sortDirection } = query

        const queryBuilder = this.applicationRepository.createQueryBuilder("applications")

        queryBuilder.leftJoinAndSelect("applications.createdBy", "users")
        queryBuilder.leftJoinAndSelect("applications.createdFor", "children")
        queryBuilder.leftJoinAndSelect("applications.answers", "answers")

        queryBuilder.leftJoinAndSelect("applications.lesson", "lessons")
        queryBuilder.leftJoinAndSelect("applications.pricingTier", "pricingTiers")

        if (status) {
            queryBuilder.where("applications.status = :status", { status })
        }

        if (dateFrom) {
            queryBuilder.andWhere("applications.createdAt >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("applications.createdAt <= :dateTo", { dateTo })
        }

        if (lessonId) {
            queryBuilder.andWhere("lessons.id = :lessonId", { lessonId })
        }

        if (createdBy) {
            queryBuilder.andWhere("users.id = :createdBy", { createdBy })
        }

        if (createdFor) {
            queryBuilder.andWhere("children.id = :createdFor", { createdFor })
        }

        queryBuilder.orderBy("applications.createdAt", sortDirection)
        queryBuilder.skip((page - 1) * limit).take(limit)

        const [applications, totalCount] = await queryBuilder.getManyAndCount()
        const totalPagesAmount = Math.ceil(totalCount / limit)

        this.logger.debug("Get application list: ", applications)
        return {
            data: applications,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: page,
            },
        }
    }


    async findById(id: number) {
        const application = await this.applicationRepository.findOne({
            where: { id },
            select: {
                createdBy: {
                    id: true,
                    email: true,
                    firstName: true,
                    secondName: true,
                },
                createdFor: {
                    id: true,
                    firstName: true,
                    secondName: true,
                    birthDate: true,
                },
            },
            relations: {
                createdBy: true,
                createdFor: true,
                answers: {
                    question: true,
                    selectedOption: true,
                },
            },
        })

        if (!application) {
            this.logger.log(`No application with id: ${id}`)
            throw new NotFoundException(`Application with id ${id} not found`)
        }

        this.logger.log(`Finded application with id: ${id}`)
        this.logger.debug("Get application: ", application)
        return application
    }


    async approve(applicationId: number) {
        await this.applicationRepository.manager.transaction(async (manager) => {
            const application = await manager.findOne(ApplicationEntity,
                {
                    where: { id: applicationId },
                    relations: {
                        createdFor: true,
                        lesson: true,
                        pricingTier: true,
                    },
                }
            )

            if (!application) throw new NotFoundException("Application not found")

            if (application.status !== ApplicationStatus.PENDING) {
                throw new BadRequestException("Cannot approve application")
            }

            await manager.update(ApplicationEntity,
                { id: applicationId },
                { status: ApplicationStatus.APPROVED },
            )

            const saveResult = await manager.save(EnrollmentEntity,
                {
                    application: { id: applicationId },
                    lesson: { id: application.lesson?.id },
                    child: { id: application.createdFor.id },
                    pricingTier: { id: application.pricingTier.id },
                    sessionsTotal: application.pricingTier.sessionsCount,
                    sessionsLeft: application.pricingTier.sessionsCount,
                    enrolledAt: new Date(),
                    status: EnrollmentStatus.ACTIVE,
                },
            )

            this.logger.log(`Application with id ${applicationId} approved, enrollment created`)
            return saveResult
        })
    }


    async reject(applicationId: number) {
        const updateResult = await this.changeStatus(
            applicationId,
            ApplicationStatus.REJECTED,
            ApplicationStatus.PENDING,
        )

        return updateResult
    }


    async block(applicationId: number) {
        const updateResult = await this.changeStatus(
            applicationId,
            ApplicationStatus.BLOCKED,
            ApplicationStatus.APPROVED,
        )
        
        return updateResult
    }


    async unblock(applicationId: number) {
        const updateResult = await this.changeStatus(
            applicationId,
            ApplicationStatus.APPROVED,
            ApplicationStatus.BLOCKED,
        )
        
        return updateResult
    }


    async revoke(applicationId: number) {
        const updateResult = await this.changeStatus(
            applicationId,
            ApplicationStatus.REJECTED,
            ApplicationStatus.APPROVED,
        )
        
        return updateResult
    }


    private async changeStatus(
        applicationId: number,
        newStatus: ApplicationStatus,
        allowedStatus: ApplicationStatus,
    ) {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
        })

        if (!application) throw new NotFoundException("Application not found")

        if (application.status !== allowedStatus) {
            throw new BadRequestException(
                `Cannot change status to "${newStatus}": application is 
                "${application.status}" but expected "${allowedStatus}"`
            )
        }

        const updateResult = await this.applicationRepository.update(
            { id: applicationId },
            { status: newStatus },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update application with id: ${applicationId}`)
            throw new NotFoundException(`Application with id ${applicationId} not found`)
        }

        this.logger.log(`Application with id ${applicationId} status changed to ${newStatus}`)
        return updateResult
    }
}