import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { IChildrenService } from "../interfaces/children-service.interface"
import { CreateChildBodyDto, UpdateChildBodyDto } from "../dto"
import { ChildRepository } from "../abstracts/child-repository.abstract"

@Injectable()
export class ChildrenService implements IChildrenService {
    private readonly logger = new Logger(ChildrenService.name)

    constructor(private readonly childRepository: ChildRepository) {}

    async create(userId: number, data: CreateChildBodyDto) {
        const child = await this.childRepository.create(userId, data)

        this.logger.log(`Created child by user id: ${userId}`)
        this.logger.debug("Created child", child)
        return child
    }


    async findAll(userId: number) {
        const children = await this.childRepository.findAllByUserId(userId)

        this.logger.debug("Get children list: ", children)
        return children
    }


    async findById(userId: number, childId: number) {
        const child = await this.childRepository.findByIdAndUserId(childId, userId)

        if (!child) throw new NotFoundException("Child not found")
        
        return child
    }


    async update(userId: number, childId: number, data: UpdateChildBodyDto) {
        const updateResult = await this.childRepository.updateByIdAndUserId(childId, userId, data)
    
        if (!updateResult) {
            this.logger.debug(`Cannot update child with id: ${childId}`)
            throw new NotFoundException("Child not found")
        }
    }


    async delete(userId: number, childId: number) {
        const isChildExists = await this.childRepository.existsByIdAndUserId(childId, userId)

        if (!isChildExists) throw new NotFoundException("Child not found")

        const hasEnrollments = await this.childRepository.existsNotSuspendedEnrollments(childId)

        if (hasEnrollments) {
            this.logger.log(`Cannot delete child with active enrollments with id: ${childId}`)
            throw new ConflictException("Cannot delete child with active enrollments")
        }

        this.logger.log(`Deleting child with id: ${childId}`)
        const deleteResult = await this.childRepository.delete(childId)

        if (!deleteResult) {
            this.logger.log(`Cannot delete child. No child with id: ${childId}`)
            throw new NotFoundException(`Child with id ${childId} not found`)
        }
    }
}