import { Injectable, Logger } from "@nestjs/common"
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
        throw new Error("Method not implemented.")
    }


    async findById(enrollmentId: number) {
        throw new Error("Method not implemented.")
    }


    async update(enrollmentId: number, data: UpdateEnrollmentBodyDto) {
        throw new Error("Method not implemented.")
    }
}