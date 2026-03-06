import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "./entities/user.entity"
import { Repository } from "typeorm"
import * as argon2 from "argon2"

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    async create(email: string, password: string): Promise<UserEntity> {
        const isAvailable = await this.isEmailAvailable(email)
        if (!isAvailable) {
            this.logger.log(`Cannot create user. Email ${email} is already used`)
            throw new ConflictException(`Email ${email} is already used`)
        }
    
        const hashedPassword = await this.hashData(password)
    
        const user = await this.userRepository.save({
            email,
            password: hashedPassword,
        })
    
        this.logger.log(`Created user with email: ${email}`)
        this.logger.debug("Created user", user)
        return user
    }


    async update(userId: number, user: UserEntity) {
        const updateResult = await this.userRepository.update({ id: userId }, user)
    
        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update user with id: ${userId}`)
            throw new NotFoundException("User not found")
        }
    
        return updateResult
    }


    async findById(id: number): Promise<UserEntity> {
        const user = await this.userRepository
            .createQueryBuilder("users")
            .where("users.id = :id", { id })
            .select(["users.firstName", "users.id", "users.email"])
            .getOne()
        
        if (!user) {
            this.logger.log(`No user with id: ${id}`)
            throw new UnauthorizedException()
        }
    
        this.logger.log(`Finded user with id: ${id}`)
        return user
    }


    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.userRepository
            .createQueryBuilder("users")
            .where("users.email = :email", { email })
            .getOne()

        this.logger.log(`Finded user with email: ${email}`)
        return user
    }


    async findByEmailWithVerification(email: string): Promise<UserEntity | null> {
        return this.userRepository
            .createQueryBuilder("users")
            .leftJoinAndSelect("users.emailVerification", "emailVerification")
            .where("users.email = :email", { email })
            .getOne()
    }


    private async isEmailAvailable(email: string): Promise<boolean> {
        const existingUser = await this.userRepository.findOne({
            where: { email },
        })
        return !existingUser
    }


    private hashData(data: string): Promise<string> {
        return argon2.hash(data)
    }
}