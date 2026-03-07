import { Body, Controller, Ip, Post, Headers, Res, Request, HttpStatus, UseGuards } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { SignUpDto } from "./dto/signup.dto"
import { SignUpConfirmDto } from "./dto/signup-confirm.dto"
import { Response } from "express"
import { SignInDto } from "./dto/signin.dto"
import { AccessTokenGuard } from "../common/guards/access-token.guard"
import { RefreshTokenGuard } from "../common/guards/refresh-token.guard"
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { JWTTokensReturnDto } from "./dto/jwt-tokens-return.dto"

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({
        summary: "Регистрация аккаунта по имени, почте и паролю",
    })
    @ApiBody({
        description: "Данные для регистрации акаунта",
        type: SignUpDto,
        required: true,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Код подтверждения отправлен на почту",
    })
    @Post("signup")
    async signup(@Body() signUpDto: SignUpDto) {
        await this.authService.signUp(signUpDto)

        return {
            message: "Confirmation code sent to your mail",
        }
    }


    @ApiOperation({
        summary: "Подтверждение регистрации аккаунта",
    })
    @ApiHeader({
        name: "user-agent",
        description: "User-Agent заголовок",
        required: true,
        example: "Mozilla/5.0",
    })
    @ApiHeader({
        name: "x-fingerprint",
        description: "Уникальный отпечаток устройства",
        required: true,
        example: "123456789abcdef",
    })
    @ApiBody({
        description: "Данные для подтверждения регистрации",
        type: SignUpConfirmDto,
        required: true,
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: "Пользователь успешно зарегистрирован",
        type: JWTTokensReturnDto,
    })
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


    @ApiOperation({
        summary: "Авторизация пользователя",
    })
    @ApiBody({
        description: "Данные для входа в аккаунт",
        type: SignInDto,
        required: true,
    })
    @ApiHeader({
        name: "user-agent",
        description: "User-Agent заголовок",
        required: true,
        example: "Mozilla/5.0",
    })
    @ApiHeader({
        name: "x-fingerprint",
        description: "Уникальный отпечаток устройства",
        required: true,
        example: "123456789abcdef",
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Успешный вход",
        type: JWTTokensReturnDto,
    })
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


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Удаление пользовательской сессии",
    })
    @ApiHeader({
        name: "x-fingerprint",
        description: "Уникальный отпечаток устройства",
        required: true,
        example: "123456789abcdef",
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Успешный выход",
    })
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


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Обновление токенов",
    })
    @ApiHeader({
        name: "user-agent",
        description: "User-Agent заголовок",
        required: true,
        example: "Mozilla/5.0",
    })
    @ApiHeader({
        name: "x-fingerprint",
        description: "Уникальный отпечаток устройства",
        required: true,
        example: "123456789abcdef",
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Токены обновлены",
        type: JWTTokensReturnDto,
    })
    @Post("refresh")
    @UseGuards(RefreshTokenGuard)
    async refreshTokens(
        @Request() req,
        @Headers("user-agent") userAgent: string,
        @Headers("x-fingerprint") fingerprint: string,
        @Headers("x-refresh-token") refreshToken: string,
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