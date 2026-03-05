import { Module } from "@nestjs/common"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthIdentityEntity } from "./entities/auth-identity.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AuthIdentityEntity,
        ]),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}