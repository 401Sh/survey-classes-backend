import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserChildEntity } from "../entities/user-child.entity"
import { Repository } from "typeorm"
import { CreateChildBodyDto } from "../dto/create-child-body.dto"
import { UpdateChildBodyDto } from "../dto/update-child-body.dto"
import { EnrollmentEntity } from "src/applications/entities/enrollment.entity"
import { EnrollmentStatus } from "src/applications/enums/enrollment-status.enum"

@Injectable()
export class ChildrenService {
    private readonly logger = new Logger(ChildrenService.name)

    constructor(
        @InjectRepository(UserChildEntity)
        private childRepository: Repository<UserChildEntity>,
        @InjectRepository(EnrollmentEntity)
        private enrollmentRepository: Repository<EnrollmentEntity>,
    ) {}

    async create(userId: number, data: CreateChildBodyDto) {
        const child = this.childRepository.save({
            user: { id: userId },
            ...data,
        })

        this.logger.log(`Created child by user id: ${userId}`)
        this.logger.debug("Created child", child)
        return child
    }


    async findAll(userId: number) {
        const children = await this.childRepository.find({
            where: {
                user: { id: userId },
            },
        })

        this.logger.debug("Get survey list: ", children)
        return children
    }


    async findById(userId: number, childId: number) {
        const child = await this.childRepository.findOne({
            where: {
                id: childId,
                user: { id: userId },
            },
            select: {
                id: true,
                firstName: true,
                secondName: true,
                birthDate: true,
            },
        })

        if (!child) throw new NotFoundException("Child not found")
        
        return child
    }


    // TODO: add sorting queries
    async findChildEnrollments(userId: number, childId: number) {
        const child = await this.childRepository.findOne({
            where: {
                id: childId,
                user: { id: userId },
            },
        })
    
        if (!child) throw new NotFoundException("Child not found")
    
        const enrollments = await this.enrollmentRepository.find({
            where: {
                child: { id: childId },
                status: EnrollmentStatus.ACTIVE,
            },
            relations: {
                lesson: true,
            },
            select: {
                id: true,
                status: true,
                enrolledAt: true,
                sessionsTotal: true,
                sessionsLeft: true,
                paymentStatus: true,
                paidAmount: true,
                lesson: {
                    id: true,
                    name: true,
                    description: true,
                },
            },
        })

        this.logger.debug("Get child enrollments list: ", enrollments)
        return enrollments
    }


    async update(userId: number, childId: number, data: UpdateChildBodyDto) {
        const updateResult = await this.childRepository.update(
            {
                id: childId,
                user: {
                    id: userId,
                },
            },
            data,
        )
    
        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update child with id: ${childId}`)
            throw new NotFoundException("Child not found")
        }
    
        return updateResult
    }


    async delete(userId: number, childId: number) {
        this.logger.log(`Deleting child with id: ${childId}`)
        const deleteResult = await this.childRepository.delete({
            id: childId,
            user: { id: userId },
        })

        if (deleteResult.affected === 0) {
            this.logger.log(`Cannot delete child. No child with id: ${childId}`)
            throw new NotFoundException(`Child with id ${childId} not found`)
        }

        return deleteResult
    }
}