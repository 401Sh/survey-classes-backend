import { UpdateUserBodyDto } from "../dto/update-user-body.dto"
import { UserEntity } from "../entities/user.entity"

export interface IUsersService {
    findById(id: number): Promise<UserEntity>
    updateName(userId: number, data: UpdateUserBodyDto): Promise<void>
}