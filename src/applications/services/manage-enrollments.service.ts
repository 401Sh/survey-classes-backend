import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { Repository } from "typeorm"
import { UpdateEnrollmentBodyDto } from "../dto/update-enrollment-body.dto"
import { GetEnrollmentListQueryDto } from "../dto/get-enrollment-list-query.dto"

@Injectable()
export class ManageEnrollmentsService {
    private readonly logger = new Logger(ManageEnrollmentsService.name)

    constructor(
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
    ) {}

    async findAll(query: GetEnrollmentListQueryDto) {
        const { limit, page, dateFrom, dateTo, status, lessonId, parentId, childId, sortDirection } = query

        const queryBuilder = this.enrollmentRepository.createQueryBuilder("enrollments")

        queryBuilder.leftJoinAndSelect("enrollments.application", "applications")
        queryBuilder.leftJoinAndSelect("enrollments.lesson", "lessons")
        queryBuilder.leftJoinAndSelect("enrollments.child", "children")

        queryBuilder.leftJoinAndSelect("children.user", "users")

        if (status) {
            queryBuilder.where("enrollments.status = :status", { status })
        }

        if (dateFrom) {
            queryBuilder.andWhere("enrollments.createdAt >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("enrollments.createdAt <= :dateTo", { dateTo })
        }

        if (lessonId) {
            queryBuilder.andWhere("surveys.lessons.id = :lessonId", { lessonId })
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


    async update(enrollmentId: number, data: UpdateEnrollmentBodyDto) {
        const updateResult = await this.enrollmentRepository.update({ id: enrollmentId }, data)
    
        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update enrollment with id: ${enrollmentId}`)
            throw new NotFoundException("Enrollment not found")
        }
    
        return updateResult
    }
}