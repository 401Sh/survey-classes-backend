import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class ApiKeyGuard implements CanActivate {
    private readonly apiKey: string

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.getOrThrow("API_KEY")
    }

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>()

        const key = req.headers["x-api-key"]

        if (!key || key !== this.apiKey) throw new UnauthorizedException("Invalid API key")

        return true
    }
}