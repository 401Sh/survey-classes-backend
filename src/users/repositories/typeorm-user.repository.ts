import { Injectable } from "@nestjs/common"
import { CreateUserData, UserData, UserRepository } from "../abstracts/user-repository.abstract"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UserEntity } from "../entities/user.entity"

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async create(data: CreateUserData): Promise<UserEntity> {
        const user = await this.userRepository.save(data)

        return user
    }


    async findSimplifiedById(id: number): Promise<UserEntity | null> {
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


    async findByEmailWithVerification(email: string) {
        const user = this.userRepository.findOne({
            where: { email },
            relations: {
                emailVerification: true
            },
        })

        return user
    }


    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.userRepository.findOne({
            where: { email: email },
        })

        return user
    }


    async existsByEmail(email: string): Promise<boolean> {
        const isUserExists = await this.userRepository.exists({
            where: { email },
        })

        return isUserExists
    }


    async update(id: number, data: UserData): Promise<boolean> {
        const updateResult = await this.userRepository.update(id, data)

        return (updateResult.affected && updateResult.affected > 0) ? true : false
    }
}