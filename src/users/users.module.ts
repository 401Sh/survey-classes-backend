import { Module } from "@nestjs/common"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "./entities/user.entity"
import { ChildEntity } from "./entities/child.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            ChildEntity,
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}