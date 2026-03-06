import { Body, Controller, Ip, Post, Headers, Res, Request, HttpStatus, UseGuards } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { SignUpDto } from "./dto/signup.dto"
import { SignUpConfirmDto } from "./dto/signup-confirm.dto"
import { Response } from "express"
import { SignInDto } from "./dto/signin.dto"
import { AccessTokenGuard } from "./guards/access-token.guard"
import { RefreshTokenGuard } from "./guards/refresh-token.guard"

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("signup")
    async signup(@Body() signUpDto: SignUpDto) {
        await this.authService.signUp(signUpDto)

        return {
            message: "Confirmation code sent to your mail",
        }
    }


    @Post("signup/confirm")
    async confirmEmail(
        @Headers("user-agent") userAgent: string,
        @Headers("x-fingerprint") fingerprint: string,
        @Ip() ip: string,
        @Body() signUpConfirmDto: SignUpConfirmDto,
        @Res() res: Response,
    ) {
        const tokens = await this.authService.confirmEmail(
            signUpConfirmDto,
            userAgent,
            ip,
            fingerprint,
        )
    
        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        })
    }


    @Post("signin")
    async signin(
        @Headers("user-agent") userAgent: string,
        @Headers("x-fingerprint") fingerprint: string,
        @Ip() ip: string,
        @Body() signInDto: SignInDto,
        @Res() res: Response,
    ) {
        const tokens = await this.authService.signIn(
            signInDto,
            userAgent,
            ip,
            fingerprint,
        )

        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        })
    }


    @Post("logout")
    @UseGuards(AccessTokenGuard)
    async logout(
        @Headers("x-fingerprint") fingerprint: string,
        @Request() req,
        @Res() res: Response,
    ) {
        const userId = req.user.userId

        await this.authService.deleteSession(userId, fingerprint)

        return res.status(HttpStatus.OK).send({
            message: "Succesfully logout",
        })
    }


    @Post("refresh")
    @UseGuards(RefreshTokenGuard)
    async refreshTokens(
        @Request() req,
        @Headers("user-agent") userAgent: string,
        @Headers("x-fingerprint") fingerprint: string,
        @Headers('x-refresh-token') refreshToken: string,
        @Ip() ip: string,
        @Res() res: Response,
    ) {
        const userId = req.user.userId

        const tokens = await this.authService.refreshTokens(
            userId,
            refreshToken,
            userAgent,
            ip,
            fingerprint,
        )

        return res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        })
    }
}