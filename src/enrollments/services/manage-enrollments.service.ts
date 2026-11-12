import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { IManageEnrollmentsService } from "../interfaces/manage-enrollments-service.interface"
import { GetManageEnrollmentListQueryDto } from "../dto"
import { EnrollmentRepository } from "../abstracts/enrollment-repository.abstract"

@Injectable()
export class ManageEnrollmentsService implements IManageEnrollmentsService {
    private readonly logger = new Logger(ManageEnrollmentsService.name)

    constructor(private readonly enrollmentRepository: EnrollmentRepository) {}

    async findAll(query: GetManageEnrollmentListQueryDto) {
        const [enrollments, totalCount] = await this.enrollmentRepository.findPage(query)
        const totalPagesAmount = Math.ceil(totalCount / query.limit)

        this.logger.debug("Get enrollment list: ", enrollments)
        return {
            data: enrollments,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: query.page,
            },
        }
    }


    async findById(id: number) {
        const enrollment = await this.enrollmentRepository.findByIdWithDetails(id)

        if (!enrollment) {
            this.logger.log(`No enrollment with id: ${id}`)
            throw new NotFoundException(`Enrollment with id ${id} not found`)
        }

        this.logger.log(`Finded enrollment with id: ${id}`)
        this.logger.debug("Get enrollment: ", enrollment)
        return enrollment
    }


    async activate(enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findById(enrollmentId)

        if (!enrollment) throw new NotFoundException("Enrollment not found")

        if (enrollment.status !== EnrollmentStatus.PENDING) {
            throw new BadRequestException("Only pending enrollments can be activated")
        }

        const updateResult = await this.enrollmentRepository.updateStatus(
            enrollmentId,
            EnrollmentStatus.ACTIVE,
        )

        if (!updateResult) {
            this.logger.debug(`Cannot activate enrollment with id: ${enrollmentId}`)
            throw new NotFoundException("Enrollment not found")
        }
    }


    async suspend(enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findById(enrollmentId)

        if (!enrollment) throw new NotFoundException("Enrollment not found")

        if (enrollment.status !== EnrollmentStatus.ACTIVE) {
            throw new BadRequestException("Only active enrollments can be suspended")
        }

        const updateResult = await this.enrollmentRepository.updateStatus(
            enrollmentId,
            EnrollmentStatus.SUSPENDED,
        )

        if (!updateResult) {
            this.logger.debug(`Cannot suspend enrollment with id: ${enrollmentId}`)
            throw new NotFoundException("Enrollment not found")
        }
    }


    async unsuspend(enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findById(enrollmentId)

        if (!enrollment) throw new NotFoundException("Enrollment not found")

        if (enrollment.status !== EnrollmentStatus.SUSPENDED) {
            throw new BadRequestException("Only suspended enrollments can be re-activated")
        }

        const updateResult = await this.enrollmentRepository.updateStatus(
            enrollmentId,
            EnrollmentStatus.ACTIVE,
        )

        if (!updateResult) {
            this.logger.debug(`Cannot re-activate enrollment with id: ${enrollmentId}`)
            throw new NotFoundException("Enrollment not found")
        }
    }
}