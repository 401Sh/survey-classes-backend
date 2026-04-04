import { Controller, Get } from "@nestjs/common"
import { AppService } from "./app.service"
import { Public } from "./common/decorators/public.decorator"
import { ApiSecurity } from "@nestjs/swagger"

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @ApiSecurity("api-key")
    @Public()
    @Get()
    getHello(): string {
        return this.appService.getHello()
    }
}