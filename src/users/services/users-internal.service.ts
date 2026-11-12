import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { UserEntity } from "../entities/user.entity"
import * as argon2 from "argon2"
import { IUsersInternalService } from "../interfaces/users-internal-service.interface"
import { SignUpDto } from "src/auth/dto"
import { UserRepository } from "../abstracts/user-repository.abstract"

@Injectable()
export class UsersInternalService implements IUsersInternalService {
    private readonly logger = new Logger(UsersInternalService.name)

    constructor(private readonly userRepository: UserRepository) {}
    
    async create(data: SignUpDto): Promise<UserEntity> {
        const isEmailAvailable = await this.userRepository.existsByEmail(data.email)

        if (isEmailAvailable) {
            this.logger.log(`Cannot create user. Email ${data.email} is already used`)
            throw new ConflictException(`Email ${data.email} is already used`)
        }

        const hashedPassword = await this.hashData(data.password)
        
        data.password = hashedPassword
    
        const user = await this.userRepository.create(data)
    
        this.logger.log(`Created user with email: ${data.email}`)
        this.logger.debug("Created user", user)
        return user
    }


    async findByEmailWithPass(email: string) {
        const user = await this.userRepository.findByEmail(email)

        this.logger.log(`Finded user with email: ${email}`)

        return user
    }


    async findByEmailWithVerification(email: string) {
        const user = this.userRepository.findByEmailWithVerification(email)

        return user
    }


    async findByIdOrUnauthorized(id: number) {
        const user = await this.userRepository.findSimplifiedById(id)

        if (!user) throw new UnauthorizedException()
        
        return user
    }


    async update(userId: number, data: Partial<UserEntity>) {
        const updateResult = await this.userRepository.update(userId, data)
    
        if (!updateResult) {
            this.logger.debug(`Cannot update user with id: ${userId}`)
            throw new NotFoundException("User not found")
        }
    }


    private hashData(data: string): Promise<string> {
        return argon2.hash(data)
    }
}