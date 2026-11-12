import { UserChildEntity } from "../entities/user-child.entity"

export type ChildData = {
    firstName?: string,
    secondName?: string,
    birthDate?: Date,
    password?: string,
    isEmailVerified?: boolean,
}

export type CreateChildData = {
    firstName: string,
    secondName?: string,
    birthDate: Date,
}

export abstract class ChildRepository {
    abstract create(userId: number, data: CreateChildData): Promise<UserChildEntity>
    abstract findByIdAndUserId(id: number, userId: number): Promise<UserChildEntity | null>
    abstract findAllByUserId(userId: number): Promise<UserChildEntity[]>
    abstract existsNotSuspendedEnrollments(id: number): Promise<boolean>
    abstract existsByIdAndUserId(id: number, userId: number): Promise<boolean>
    abstract updateByIdAndUserId(id: number, userId: number, data: ChildData): Promise<boolean>
    abstract delete(id: number): Promise<boolean>
}