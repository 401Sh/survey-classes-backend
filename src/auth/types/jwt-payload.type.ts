import { UserRole } from "src/users/enums/user-role.enum"

export type JwtAccessPayload = {
    sub: string,
    email: string,
    role: UserRole,
}


export type JwtRefreshPayload = {
    sub: string,
}