import { Module } from "@nestjs/common"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "./entities/user.entity"
import { UserChildEntity } from "./entities/user-child.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            UserChildEntity,
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}