import { CreateChildBodyDto } from "../dto/create-child-body.dto"
import { UpdateChildBodyDto } from "../dto/update-child-body.dto"
import { UserChildEntity } from "../entities/user-child.entity"

export interface IChildrenService {
    create(userId: number, data: CreateChildBodyDto): Promise<UserChildEntity>
    findAll(userId: number): Promise<UserChildEntity[]>
    findById(userId: number, childId: number): Promise<UserChildEntity>
    update(userId: number, childId: number, data: UpdateChildBodyDto): Promise<void>
    delete(userId: number, childId: number): Promise<void>
}