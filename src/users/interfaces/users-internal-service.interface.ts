import { SignUpDto } from "src/auth/dto/signup.dto"
import { UserEntity } from "../entities/user.entity"

export interface IUsersInternalService {
    create(data: SignUpDto): Promise<UserEntity>
    findUser(id: number): Promise<UserEntity | null>
    findByEmailWithPass(email: string): Promise<UserEntity | null>
    findByEmailWithVerification(email: string): Promise<UserEntity | null>
    findByIdOrUnauthorized(id: number): Promise<UserEntity>
    update(userId: number, data: Partial<UserEntity>): Promise<void>
}