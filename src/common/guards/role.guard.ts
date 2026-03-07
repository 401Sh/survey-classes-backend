import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { UserRole } from "src/users/enums/user-role.enum"
import { ROLES_KEY } from "../decorators/role.decorator"

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name)

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (!requiredRoles) return true

        const request = context.switchToHttp().getRequest()
        const { user, method, url } = request
        
        if (!requiredRoles.includes(user.role)) {
            this.logger.warn(
                `Access denied for user ${user.sub} with role "${user.role}" on ${method} ${url}. Required: [${requiredRoles}]`
            )
            throw new ForbiddenException("Access denied")
        }

        return true
    }
}