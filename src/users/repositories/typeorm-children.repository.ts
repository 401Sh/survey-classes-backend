import { Injectable } from "@nestjs/common"
import { ChildData, ChildRepository, CreateChildData } from "../abstracts/child-repository.abstract"
import { UserChildEntity } from "../entities/user-child.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Not, Repository } from "typeorm"
import { EnrollmentStatus } from "src/enrollments/enums/enrollment-status.enum"

@Injectable()
export class TypeOrmChildRepository implements ChildRepository {
    constructor(
        @InjectRepository(UserChildEntity)
        private readonly childRepository: Repository<UserChildEntity>,
    ) {}

    async create(userId: number, data: CreateChildData): Promise<UserChildEntity> {
        const child = await this.childRepository.save({
            ...data,
            user: { id: userId },
        })

        return child
    }


    async findByIdAndUserId(id: number, userId: number): Promise<UserChildEntity | null> {
        const child = await this.childRepository.findOne({
            where: {
                id,
                user: { id: userId }
            },
            select: {
                id: true,
                firstName: true,
                secondName: true,
                birthDate: true,
            },
        })

        return child
    }


    async findAllByUserId(userId: number): Promise<UserChildEntity[]> {
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

        return children
    }


    async existsNotSuspendedEnrollments(id: number): Promise<boolean> {
        const hasEnrollments = await this.childRepository.exists({
            where: {
                id,
                enrollments: { status: Not(EnrollmentStatus.SUSPENDED) },
            },
            relations: { enrollments: true },
        })

        return hasEnrollments
    }


    async existsByIdAndUserId(id: number, userId: number): Promise<boolean> {
        const isChildExists = await this.childRepository.exists({
            where: {
                id,
                user: { id: userId },
            },
        })

        return isChildExists
    }


    async updateByIdAndUserId(id: number, userId: number, data: ChildData): Promise<boolean> {
        const updateResult = await this.childRepository.update(
            {
                id,
                user: { id: userId }
            },
            data,
        )

        return (updateResult.affected && updateResult.affected > 0) ? true : false
    }


    async delete(id: number): Promise<boolean> {
        const deleteResult = await this.childRepository.delete({ id })

        return (deleteResult.affected && deleteResult.affected > 0) ? true : false
    }
}