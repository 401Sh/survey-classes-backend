import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EnrollmentsController } from "./controllers/enrollments.controller"
import { EnrollmentEntity } from "./entities/enrollment.entity"
import { ManageEnrollmentsController } from "./controllers/manage-enrollments.controller"
import { EnrollmentsService } from "./services/enrollments.service"
import { ManageEnrollmentsService } from "./services/manage-enrollments.service"
import { SubscriptionEntity } from "src/subscriptions/entities/subscription.entity"
import { UsersModule } from "src/users/users.module"
import { LessonsModule } from "src/lessons/lessons.module"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EnrollmentEntity,
            SubscriptionEntity,
        ]),
        UsersModule,
        LessonsModule,
    ],
    controllers: [
        EnrollmentsController,
        ManageEnrollmentsController,
    ],
    providers: [
        EnrollmentsService,
        ManageEnrollmentsService,
    ],
})
export class EnrollmentsModule {}