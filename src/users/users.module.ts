import { Module } from "@nestjs/common"
import { UsersController } from "./controllers/users.controller"
import { UsersService } from "./services/users.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "./entities/user.entity"
import { UserChildEntity } from "./entities/user-child.entity"
import { ChildrenController } from "./controllers/children.controller"
import { ChildrenService } from "./services/children.service"
import { UsersInternalService } from "./services/users-internal.service"
import { ChildrenInternalService } from "./services/children-internal.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            UserChildEntity,
        ]),
    ],
    controllers: [
        UsersController,
        ChildrenController,
    ],
    providers: [
        UsersService,
        ChildrenService,
        UsersInternalService,
        ChildrenInternalService,
    ],
    exports: [
        UsersInternalService,
        ChildrenInternalService,
    ],
})
export class UsersModule {}