import { Injectable } from "@nestjs/common"
import { SignUpConfirmDto } from "./dto/signup-confirm.dto"
import { SignInDto } from "./dto/signin.dto"
import { JwtService } from "@nestjs/jwt"

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    refreshTokens(userId: any, refreshToken: any, userAgent: string, ip: string, fingerprint: string) {
        throw new Error("Method not implemented.")
    }


    deleteRefreshSession(userId: any, fingerprint: string) {
        throw new Error("Method not implemented.")
    }


    signIn(signInDto: SignInDto, userAgent: string, ip: string, fingerprint: string) {
        throw new Error("Method not implemented.")
    }


    confirmEmail(signUpConfirmDto: SignUpConfirmDto, userAgent: string, ip: string, fingerprint: string) {
        throw new Error("Method not implemented.")
    }
}