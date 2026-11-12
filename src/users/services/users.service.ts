import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { IUsersService } from "../interfaces/users-service.interface"
import { UpdateUserBodyDto } from "../dto"
import { UserRepository } from "../abstracts/user-repository.abstract"

@Injectable()
export class UsersService implements IUsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(private readonly userRepository: UserRepository) {}

    async updateName(userId: number, data: UpdateUserBodyDto) {
        const updateResult = await this.userRepository.update(userId, data)

        if (!updateResult) {
            this.logger.debug(`Cannot update user with id: ${userId}`)
            throw new NotFoundException("User not found")
        }
    }


    async findById(id: number) {
        const user = await this.userRepository.findSimplifiedById(id)

        if (!user) throw new NotFoundException("User not found")
        
        return user
    }
}