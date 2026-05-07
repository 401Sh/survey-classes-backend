import { UserEntity } from "src/users/entities/user.entity"

export interface IMailService {
    sendUserConfirmation(user: UserEntity, code: string): Promise<void>
    sendPasswordReset(user: UserEntity, code: string): Promise<void>
}