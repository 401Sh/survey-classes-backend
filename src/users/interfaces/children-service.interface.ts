import { CreateChildBodyDto, UpdateChildBodyDto } from "../dto"
import { UserChildEntity } from "../entities/user-child.entity"

export interface IChildrenService {
    create(userId: number, data: CreateChildBodyDto): Promise<UserChildEntity>
    findAll(userId: number): Promise<UserChildEntity[]>
    findById(userId: number, childId: number): Promise<UserChildEntity>
    update(userId: number, childId: number, data: UpdateChildBodyDto): Promise<void>
    delete(userId: number, childId: number): Promise<void>
}