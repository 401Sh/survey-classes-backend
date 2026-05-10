import { Body, Controller, Ip, Post, Headers, Res, Request, HttpStatus, UseGuards, Delete } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { SignUpDto } from "./dto/signup.dto"
import { SignUpConfirmDto } from "./dto/signup-confirm.dto"
import { Response } from "express"
import { SignInDto } from "./dto/signin.dto"
import { RefreshTokenGuard } from "../common/guards/refresh-token.guard"
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger"
import { JWTTokensReturnDto } from "./dto/jwt-tokens-return.dto"
import { Public } from "src/common/decorators/public.decorator"
import { ForgotPasswordBodyDto } from "./dto/forgot-password-body.dto"
import { ForgotPasswordConfirmBodyDto } from "./dto/forgot-password-confirm-body.dto"
import { ResetPasswordBodyDto } from "./dto/reset-password-body.dto"
import { Throttle } from "@nestjs/throttler"
import { AUTH_THROTTLE_TTL } from "src/common/constants/throttle.constant"

@Throttle({ default: {
    ttl: AUTH_THROTTLE_TTL,
    limit: AUTH_THROTTLE_TTL,
}})
@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiSecurity("api-key")
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
    @Public()
    @Post("signup")
    async signup(@Body() signUpDto: SignUpDto) {
        await this.authService.signUp(signUpDto)

        return {
            message: "Confirmation code sent to your mail",
        }
    }


    @ApiSecurity("api-key")
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
    @Public()
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


    @ApiSecurity("api-key")
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
    @Public()
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


    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Запрос на восстановление пароля",
    })
    @ApiBody({
        description: "Данные для восстановления пароля",
        type: ForgotPasswordBodyDto,
        required: true,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Код подтверждения отправлен на почту",
    })
    @Public()
    @Post("forgot-password")
    async forgotPassword(@Body() data: ForgotPasswordBodyDto) {
        await this.authService.forgotPassword(data)

        return {
            message: "Confirmation code sent to your mail",
        }
    }


    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Подтверждение кода восстановления пароля",
    })
    @ApiBody({
        description: "Данные для получения кода восстановления пароля",
        type: ForgotPasswordConfirmBodyDto,
        required: true,
    })
    @ApiResponse({ 
        status: HttpStatus.OK,
        description: "Код подтверждён, возвращён reset токен",
    })
    @Public()
    @Post("forgot-password/confirm")
    async forgotPasswordConfirm(@Body() data: ForgotPasswordConfirmBodyDto) {
        const resetToken = await this.authService.confirmForgotPassword(data)

        return resetToken
    }


    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Сброс пароля",
    })
    @ApiBody({
        description: "Данные для сброса пароля",
        type: ResetPasswordBodyDto,
        required: true,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Пароль успешно изменён",
    })
    @Public()
    @Post("reset-password")
    async resetPassword(@Body() data: ResetPasswordBodyDto) {
        await this.authService.resetPassword(data)

        return {
            message: "Password successfully changed",
        }
    }


    @ApiSecurity("api-key")
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
    @ApiHeader({
        name: "x-refresh-token",
        description: "Refresh токен",
        required: true,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Токены обновлены",
        type: JWTTokensReturnDto,
    })
    @Public()
    @Post("refresh")
    @UseGuards(RefreshTokenGuard)
    async refreshTokens(
        @Request() req,
        @Headers("user-agent") userAgent: string,
        @Headers("x-fingerprint") fingerprint: string,
        @Ip() ip: string,
        @Res() res: Response,
    ) {
        const { sub: userId, refreshToken } = req.user

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


    @ApiBearerAuth()
    @ApiSecurity("api-key")
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
    @Delete("logout")
    async logout(
        @Request() req,
        @Headers("x-fingerprint") fingerprint: string,
        @Res() res: Response,
    ) {
        const userId = req.user.sub

        await this.authService.deleteSession(userId, fingerprint)

        return res.status(HttpStatus.OK).send({
            message: "Succesfully logout",
        })
    }
}