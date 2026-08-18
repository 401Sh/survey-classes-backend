import { UserEntity } from "src/users/entities/user.entity"
import {
    SignUpDto,
    SignUpConfirmDto,
    JWTTokensReturnDto,
    SignInDto,
    ForgotPasswordBodyDto,
    ForgotPasswordConfirmBodyDto,
    ResetPasswordBodyDto
} from "../dto"

export interface IAuthService {
    signUp(data: SignUpDto): Promise<UserEntity>
    confirmEmail(
        signUpConfirmDto: SignUpConfirmDto,
        userAgent: string,
        ip: string,
        fingerprint: string,
    ): Promise<JWTTokensReturnDto>
    signIn(signInDto: SignInDto, userAgent: string, ip: string, fingerprint: string): Promise<JWTTokensReturnDto>
    forgotPassword(data: ForgotPasswordBodyDto): Promise<void>
    confirmForgotPassword(data: ForgotPasswordConfirmBodyDto): Promise<{ resetToken: string }>
    resetPassword(data: ResetPasswordBodyDto): Promise<void>
    deleteSession(userId: number, fingerprint: string): Promise<void>
    refreshTokens(
        userId: number,
        refreshToken: string,
        userAgent: string,
        ip: string,
        fingerprint: string,
    ): Promise<JWTTokensReturnDto>
}