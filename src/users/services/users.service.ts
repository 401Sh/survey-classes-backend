import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../entities/user.entity"
import { Repository } from "typeorm"
import * as argon2 from "argon2"
import { SignUpDto } from "src/auth/dto/signup.dto"
import { UpdateUserBodyDto } from "../dto/update-user-body.dto"

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    async create(data: SignUpDto): Promise<UserEntity> {
        const isAvailable = await this.isEmailAvailable(data.email)
        if (!isAvailable) {
            this.logger.log(`Cannot create user. Email ${data.email} is already used`)
            throw new ConflictException(`Email ${data.email} is already used`)
        }

        const { password, ...otherData } = data
    
        const hashedPassword = await this.hashData(data.password)
    
        const user = await this.userRepository.save({
            ...otherData,
            password: hashedPassword,
        })
    
        this.logger.log(`Created user with email: ${data.email}`)
        this.logger.debug("Created user", user)
        return user
    }


    async update(userId: number, data: Partial<UserEntity>) {
        const updateResult = await this.userRepository.update({ id: userId }, data)
    
        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update user with id: ${userId}`)
            throw new NotFoundException("User not found")
        }
    
        return updateResult
    }


    async updateName(userId: number, data: UpdateUserBodyDto) {
        const updateResult = await this.userRepository.update(
            { id: userId },
            { ...data },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update user with id: ${userId}`)
            throw new NotFoundException("User not found")
        }
    
        return updateResult
    }


    async findByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: { email },
        })

        this.logger.log(`Finded user with email: ${email}`)

        return user
    }


    async findByEmailWithVerification(email: string) {
        const user = this.userRepository.findOne({
            where: { email },
            relations: {
                emailVerification: true
            },
        })

        return user
    }


    async findByIdOrUnauthorized(id: number) {
        const user = await this.findUser(id)

        if (!user) throw new UnauthorizedException()
        
        return user
    }


    async findById(id: number) {
        const user = await this.findUser(id)

        if (!user) throw new NotFoundException("User not found")
        
        return user
    }


    private async findUser(id: number): Promise<UserEntity | null> {
        const user = this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                secondName: true,
                role: true,
            },
        })

        return user
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