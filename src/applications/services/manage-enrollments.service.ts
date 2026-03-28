import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { Repository } from "typeorm"
import { UpdateEnrollmentBodyDto } from "../dto/update-enrollment-body.dto"
import { GetManageEnrollmentListQueryDto } from "../dto/get-manage-enrollment-list-query.dto"
import { PaymentStatus } from "../enums/payment-status.enum"
import { UpdateEnrollmentPaymentBodyDto } from "../dto/update-enrollment-payment-body.dto"
import { CreateAttendanceBodyDto } from "../dto/create-attendance-body.dto"
import { GetAttendanceListQueryDto } from "../dto/get-attendance-list-query.dto"
import { AttendanceEntity } from "../entities/attendance.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"

@Injectable()
export class ManageEnrollmentsService {
    private readonly logger = new Logger(ManageEnrollmentsService.name)

    constructor(
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
        @InjectRepository(AttendanceEntity)
        private attendanceRepository: Repository<AttendanceEntity>,
    ) {}

    async createAttendance(enrollmentId: number, data: CreateAttendanceBodyDto) {
        const attendance = await this.enrollmentRepository.manager.transaction(async (manager) => {
            const enrollment = await manager.findOne(EnrollmentEntity,
                {
                    where: { id: enrollmentId },
                }
            )
        
            if (!enrollment) throw new NotFoundException("Enrollment not found")

            if ([EnrollmentStatus.FINISHED, EnrollmentStatus.LEFT].includes(enrollment.status)) {
                throw new BadRequestException(
                    `Cannot create attendance for enrollment with status ${enrollment.status}`
                )
            }

            const attendance = await manager.save(AttendanceEntity,
                {
                    ...data,
                    enrollment: { id: enrollmentId },
                }
            )

            // change sessionsLeft
            if (data.isPresent) {
                const newSessionsLeft = enrollment.sessionsLeft - 1
                // if sessionsLeft is equal to zero - change status to FINISHED
                const newStatus = newSessionsLeft <= 0 ? EnrollmentStatus.FINISHED : EnrollmentStatus.ACTIVE

                await manager.update(EnrollmentEntity,
                    { id: enrollmentId },
                    {
                        sessionsLeft: newSessionsLeft,
                        status: newStatus,
                    },
                )
            }

            return attendance
        })

        this.logger.log(`Created new attendance for enrollment: ${enrollmentId}`)
        this.logger.debug("Created new attendance: ", attendance)
        return attendance
    }


    async findAll(query: GetManageEnrollmentListQueryDto) {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            status,
            paymentStatus,
            lessonId,
            parentId,
            childId,
            sortDirection
        } = query

        const queryBuilder = this.enrollmentRepository.createQueryBuilder("enrollments")

        queryBuilder.leftJoinAndSelect("enrollments.application", "applications")
        queryBuilder.leftJoinAndSelect("enrollments.lesson", "lessons")
        queryBuilder.leftJoinAndSelect("enrollments.child", "children")
        queryBuilder.leftJoinAndSelect("enrollments.pricingTier", "pricingTiers")

        queryBuilder.leftJoinAndSelect("children.user", "users")

        if (status) {
            queryBuilder.where("enrollments.status = :status", { status })
        }

        if (paymentStatus) {
            queryBuilder.andWhere("enrollments.paymentStatus = :paymentStatus", { paymentStatus })
        }

        if (dateFrom) {
            queryBuilder.andWhere("enrollments.createdAt >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("enrollments.createdAt <= :dateTo", { dateTo })
        }

        if (lessonId) {
            queryBuilder.andWhere("lessons.id = :lessonId", { lessonId })
        }

        if (parentId) {
            queryBuilder.andWhere("users.id = :parentId", { parentId })
        }

        if (childId) {
            queryBuilder.andWhere("children.id = :childId", { childId })
        }

        queryBuilder.orderBy("enrollments.createdAt", sortDirection)
        queryBuilder.skip((page - 1) * limit).take(limit)

        const [enrollments, totalCount] = await queryBuilder.getManyAndCount()
        const totalPagesAmount = Math.ceil(totalCount / limit)

        this.logger.debug("Get enrollment list: ", enrollments)
        return {
            data: enrollments,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: page,
            },
        }
    }


    async findById(id: number) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id },
            relations: {
                application: true,
                lesson: true,
                pricingTier: true,
                child: {
                    user: true,
                },
            },
        })

        if (!enrollment) {
            this.logger.log(`No enrollment with id: ${id}`)
            throw new NotFoundException(`Enrollment with id ${id} not found`)
        }

        this.logger.log(`Finded enrollment with id: ${id}`)
        this.logger.debug("Get enrollment: ", enrollment)
        return enrollment
    }


    async findAllAttendancesByEnrollmentId(enrollmentId: number, query: GetAttendanceListQueryDto) {
        const { limit, page, dateFrom, dateTo, isPresent, sortDirection } = query

        const queryBuilder = this.attendanceRepository.createQueryBuilder("attendances")

        queryBuilder.leftJoinAndSelect("attendances.enrollment", "enrollments")
        queryBuilder.where("enrollments.id = :enrollmentId", { enrollmentId })

        if (isPresent) {
            queryBuilder.andWhere("attendances.isPresent = :isPresent", { isPresent })
        }

        if (dateFrom) {
            queryBuilder.andWhere("attendances.date >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("attendances.date <= :dateTo", { dateTo })
        }

        queryBuilder.orderBy("attendances.date", sortDirection)
        queryBuilder.skip((page - 1) * limit).take(limit)

        const [attendances, totalCount] = await queryBuilder.getManyAndCount()
        const totalPagesAmount = Math.ceil(totalCount / limit)

        this.logger.debug("Get attendance list: ", attendances)
        return {
            data: attendances,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: page,
            },
        }
    }


    async update(enrollmentId: number, data: UpdateEnrollmentBodyDto) {
        const updateResult = await this.enrollmentRepository.update({ id: enrollmentId }, data)

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update enrollment with id: ${enrollmentId}`)
            throw new NotFoundException("Enrollment not found")
        }

        return updateResult
    }


    async payEnrollment(enrollmentId: number, data: UpdateEnrollmentPaymentBodyDto) {
        const { paidAt } = data

        const enrollment = await this.enrollmentRepository.findOne({
            where: { id: enrollmentId },
            relations: { pricingTier: true },
        })

        if (!enrollment || !enrollment.pricingTier) {
            throw new NotFoundException(`Enrollment with id ${enrollmentId} not found`)
        }

        if (enrollment.paymentStatus == PaymentStatus.PAID) {
            throw new ConflictException(`Enrollment weith id ${enrollmentId} has already been paid`)
        }

        const updateResult = await this.enrollmentRepository.update(
            { id: enrollmentId },
            {
                paymentStatus: PaymentStatus.PAID,
                paidAmount: enrollment.pricingTier.price,
                paidAt: paidAt,
            }
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update enrollment payment with id: ${enrollmentId}`)
            throw new NotFoundException("Enrollment not found")
        }

        return updateResult
    }


    async refundEnrollment(enrollmentId: number) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id: enrollmentId },
            relations: { pricingTier: true },
        })

        if (!enrollment || !enrollment.pricingTier) {
            throw new NotFoundException(`Enrollment with id ${enrollmentId} not found`)
        }

        if (enrollment.paymentStatus == PaymentStatus.UNPAID) {
            throw new ConflictException(`Enrollment with id ${enrollmentId} has already been refunded`)
        }

        const updateResult = await this.enrollmentRepository.update(
            { id: enrollmentId },
            {
                paymentStatus: PaymentStatus.UNPAID,
                paidAmount: 0.0,
                paidAt: null,
            }
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update enrollment payment with id: ${enrollmentId}`)
            throw new NotFoundException("Enrollment not found")
        }

        return updateResult
    }
}