import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { EntityManager, Repository } from "typeorm"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { IEnrollmentsInternalService } from "../interfaces/enrollments-internal-service.interface"

@Injectable()
export class EnrollmentsInternalService implements IEnrollmentsInternalService {
    private readonly logger = new Logger(EnrollmentsInternalService.name)

    constructor(
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
    ) {}

    async findOwnedWithLessonAndSurvey(id: number, userId: number) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: {
                id,
                user: { id: userId },
            },
            select: {
                id: true,
                lesson: {
                    id: true,
                    requiresSurvey: true,
                    survey: { id: true },
                },
            },
            relations: {
                lesson: { survey: true },
            },
        })
    
        if (!enrollment) throw new NotFoundException(`Enrollment with id ${id} not found`)
    
        return enrollment
    }


    async activateWithManager(enrollmentId: number, manager: EntityManager) {
        await manager.update(EnrollmentEntity,
            { id: enrollmentId },
            { status: EnrollmentStatus.ACTIVE },
        )
    }
}