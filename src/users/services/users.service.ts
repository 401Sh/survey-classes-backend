import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../entities/user.entity"
import { Repository } from "typeorm"
import { UsersInternalService } from "./users-internal.service"
import { IUsersService } from "../interfaces/users-service.interface"
import { UpdateUserBodyDto } from "../dto"

@Injectable()
export class UsersService implements IUsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,

        private readonly internalServices: UsersInternalService,
    ) {}


    async updateName(userId: number, data: UpdateUserBodyDto) {
        const updateResult = await this.userRepository.update(
            { id: userId },
            { ...data },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update user with id: ${userId}`)
            throw new NotFoundException("User not found")
        }
    }


    async findById(id: number) {
        const user = await this.internalServices.findUser(id)

        if (!user) throw new NotFoundException("User not found")
        
        return user
    }
}