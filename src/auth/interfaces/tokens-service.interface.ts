import { UserEntity } from "src/users/entities/user.entity"
import { JWTTokensReturnDto } from "../dto/jwt-tokens-return.dto"
import { RefreshSessionEntity } from "../entities/refresh-session.entity"

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
    hashData(data: string): Promise<string>
    verifyData(data: string, hashedData: string): Promise<boolean>
}