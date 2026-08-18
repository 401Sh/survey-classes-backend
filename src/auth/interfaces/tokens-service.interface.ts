import { UserEntity } from "src/users/entities/user.entity"
import { RefreshSessionEntity } from "../entities/refresh-session.entity"
import { JWTTokensReturnDto } from "../dto"

export interface ITokensService {
    createRefreshSession(
        user: UserEntity,
        userAgent: string,
        ip: string,
        fingerprint: string,
    ): Promise<JWTTokensReturnDto>
    findRefreshSession(userId: number, fingerprint: string): Promise<RefreshSessionEntity | null>
    deleteRefreshSession(userId: number, fingerprint: string): Promise<void>
    signResetToken(userId: number): string
    verifyResetToken(token: string): number | null
}