import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { JWTTokensReturnDto } from "../dto/jwt-tokens-return.dto"
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "src/common/constants/jwt-token.constant"
import { InjectRepository } from "@nestjs/typeorm"
import { RefreshSessionEntity } from "../entities/refresh-session.entity"
import { Repository } from "typeorm"
import { UserEntity } from "src/users/entities/user.entity"
import * as argon2 from "argon2"
import { UserRole } from "src/users/enums/user-role.enum"

@Injectable()
export class TokensService {
    private readonly logger = new Logger(TokensService.name)

    private readonly accessSecret: string
    private readonly refreshSecret: string

    constructor(
        @InjectRepository(RefreshSessionEntity)
        private refreshSessionRepository: Repository<RefreshSessionEntity>,
        
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        this.accessSecret = this.configService.getOrThrow("JWT_ACCESS_SECRET")
        this.refreshSecret = this.configService.getOrThrow("JWT_REFRESH_SECRET")
    }


    async createRefreshSession(
        user: UserEntity,
        userAgent: string,
        ip: string,
        fingerprint: string,
      ) {
        const tokens = await this.getTokens(user.id, user.role)
        const hashedRefreshToken = await this.hashData(tokens.refreshToken)
    
        await this.refreshSessionRepository.save({
          user,
          refreshToken: hashedRefreshToken,
          userAgent,
          ip,
          fingerprint,
          expiresAt: this.createFutureDate(REFRESH_TOKEN_TTL),
        })
    
        return tokens
    }


    async findRefreshSession(userId: number, fingerprint: string) {
        const session = await this.refreshSessionRepository.findOne({
            where: {
                user: { id: userId },
                fingerprint: fingerprint,
            },
        })
    
        this.logger.debug(`Finded session for user id: ${userId}`, session)
        return session
    }


    async deleteRefreshSession(userId: number, fingerprint: string) {
        this.logger.debug(`Deleting user ${userId} session`)
        const deleteResult = await this.refreshSessionRepository.delete({
            user: { id: userId },
            fingerprint: fingerprint,
        })
    
        if (deleteResult.affected === 0) {
            this.logger.debug(`Cannot delete session. No session with user 
                id: ${userId} and fingerprint ${fingerprint}`)
            throw new NotFoundException("Session not found")
        }
    
        return deleteResult
    }
    

    private createFutureDate(milliseconds: number): Date {
        const now = new Date()
        const futureDate = new Date(now.getTime() + milliseconds)
    
        return futureDate
    }


    hashData(data: string): Promise<string> {
        return argon2.hash(data)
    }
    
    
    verifyData(data: string, hashedData: string): Promise<boolean> {
        return argon2.verify(hashedData, data)
    }


    private async getTokens(userId: number, role: UserRole): Promise<JWTTokensReturnDto> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    role,
                },
                {
                    secret: this.accessSecret,
                    expiresIn: ACCESS_TOKEN_TTL,
                },
            ),
    
            this.jwtService.signAsync(
                {
                    sub: userId,
                },
                {
                    secret: this.refreshSecret,
                    expiresIn: REFRESH_TOKEN_TTL,
                },
            ),
        ])
    
        return {
            accessToken,
            refreshToken,
        }
    }
}