import { UserEntity } from "../entities/user.entity"

export type UserData = {
    firstName?: string,
    secondName?: string,
}

export type CreateUserData = {
    email: string,
    password: string,
    firstName: string,
    secondName: string,
}

export abstract class UserRepository {
    abstract create(data: CreateUserData): Promise<UserEntity>
    abstract findSimplifiedById(id: number): Promise<UserEntity | null>
    abstract findByEmail(email: string): Promise<UserEntity | null>
    abstract findByEmailWithVerification(email: string): Promise<UserEntity | null>
    abstract existsByEmail(email: string): Promise<boolean>
    abstract update(id: number, data: UserData): Promise<boolean>
}