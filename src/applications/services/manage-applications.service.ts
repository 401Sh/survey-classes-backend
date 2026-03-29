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
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
    ) {}

    async findAll(query: GetApplicationListQueryDto) {
        const { limit, page, dateFrom, dateTo, status, lessonId, userId, childId, sortDirection } = query

        const queryBuilder = this.applicationRepository.createQueryBuilder("applications")

        queryBuilder.leftJoinAndSelect("applications.enrollment", "enrollments")

        queryBuilder.leftJoinAndSelect("enrollments.user", "users")
        queryBuilder.leftJoinAndSelect("enrollments.child", "children")
        queryBuilder.leftJoinAndSelect("enrollments.lesson", "lessons")

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

        if (userId) {
            queryBuilder.andWhere("users.id = :userId", { userId })
        }

        if (childId) {
            queryBuilder.andWhere("children.id = :childId", { childId })
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
                enrollment: {
                    user: {
                        id: true,
                        email: true,
                        firstName: true,
                        secondName: true,
                    },
                    child: {
                        id: true,
                        firstName: true,
                        secondName: true,
                        birthDate: true,
                    },
                },
            },
            relations: {
                enrollment: {
                    user: true,
                    child: true,
                },
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
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
            relations: { enrollment: true },
        })

        if (!application) throw new NotFoundException("Application not found")

        if (application.status !== ApplicationStatus.PENDING) {
            throw new BadRequestException("Cannot approve application")
        }

        await this.applicationRepository.manager.transaction(async (manager) => {
            const updateResult = await manager.update(ApplicationEntity,
                { id: applicationId },
                { status: ApplicationStatus.APPROVED },
            )

            // activate pending enrollment
            if (application.enrollment?.status === EnrollmentStatus.PENDING) {
                await manager.update(EnrollmentEntity,
                    { id: application.enrollment.id },
                    { status: EnrollmentStatus.ACTIVE },
                )
            }

            this.logger.log(`Application with id ${applicationId} approved`)
            return updateResult
        })
    }


    async reject(applicationId: number) {
        const application = await this.applicationRepository.findOne({
            where: {
                id: applicationId,
                status: ApplicationStatus.PENDING,
            },
        })

        if (!application) throw new NotFoundException("Application not found or already processed")

        const updateResult = await this.applicationRepository.update(
            { id: applicationId },
            { status: ApplicationStatus.REJECTED },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update application with id: ${applicationId}`)
            throw new NotFoundException(`Application with id ${applicationId} not found`)
        }

        this.logger.log(`Application with id ${applicationId} rejected`)
        return updateResult
    }
}