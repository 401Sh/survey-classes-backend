import { Injectable, Logger } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { JwtPayload } from "../types/jwt-payload.type"

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
    private static readonly logger = new Logger(AccessTokenStrategy.name)

    constructor() {
        const jwtSecret = process.env.JWT_ACCESS_SECRET

        if (!jwtSecret) {
        AccessTokenStrategy.logger.error("JWT_ACCESS_SECRET is not defined. Application cannot start.")
        throw new Error("JWT_ACCESS_SECRET is not defined")
        }

        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtSecret,
        ignoreExpiration: false,
        })
    }

    validate(payload: JwtPayload) {
        return payload
    }
}