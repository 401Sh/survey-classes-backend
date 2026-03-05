import { Module } from "@nestjs/common"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "./entities/user.entity"
import { UserRoleEntity } from "./entities/user-role.entity"
import { ChildEntity } from "./entities/child.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            UserRoleEntity,
            ChildEntity,
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}