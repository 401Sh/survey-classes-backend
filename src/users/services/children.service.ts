import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserChildEntity } from "../entities/user-child.entity"
import { Not, Repository } from "typeorm"
import { CreateChildBodyDto } from "../dto/create-child-body.dto"
import { UpdateChildBodyDto } from "../dto/update-child-body.dto"
import { IChildrenService } from "../interfaces/children-service.interface"
import { EnrollmentStatus } from "src/enrollments/enums/enrollment-status.enum"

@Injectable()
export class ChildrenService implements IChildrenService {
    private readonly logger = new Logger(ChildrenService.name)

    constructor(
        @InjectRepository(UserChildEntity)
        private childRepository: Repository<UserChildEntity>,
    ) {}

    async create(userId: number, data: CreateChildBodyDto) {
        const child = await this.childRepository.save({
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
            select: {
                id: true,
                firstName: true,
                secondName: true,
                birthDate: true,
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
    }


    async delete(userId: number, childId: number) {
        const hasEnrollments = await this.childRepository.exists({
            where: {
                id: childId,
                enrollments: { status: Not(EnrollmentStatus.SUSPENDED) },
            },
            relations: { enrollments: true },
        })

        if (hasEnrollments) {
            this.logger.log(`Cannot delete child with active enrollments with id: ${childId}`)
            throw new ConflictException("Cannot delete child with active enrollments")
        }

        this.logger.log(`Deleting child with id: ${childId}`)
        const deleteResult = await this.childRepository.delete({
            id: childId,
            user: { id: userId },
        })

        if (deleteResult.affected === 0) {
            this.logger.log(`Cannot delete child. No child with id: ${childId}`)
            throw new NotFoundException(`Child with id ${childId} not found`)
        }
    }
}