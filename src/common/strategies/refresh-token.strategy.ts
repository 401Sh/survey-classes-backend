import { Injectable, Logger } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { JwtRefreshPayload } from "../types/jwt-payload.type"
import { Request } from "express"

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
    private static readonly logger = new Logger(RefreshTokenStrategy.name)

    constructor() {
        const jwtSecret = process.env.JWT_REFRESH_SECRET

        if (!jwtSecret) {
            RefreshTokenStrategy.logger.error("JWT_REFRESH_SECRET is not defined. Application cannot start.")
            throw new Error("JWT_REFRESH_SECRET is not defined")
        }

        super({
            jwtFromRequest: ExtractJwt.fromHeader("x-refresh-token"),
            secretOrKey: jwtSecret,
            ignoreExpiration: false,
            passReqToCallback: true,
        })
    }

    validate(req: Request, payload: JwtRefreshPayload) {
        const refreshToken = req.headers["x-refresh-token"] as string
        return { ...payload, refreshToken }
    }
}