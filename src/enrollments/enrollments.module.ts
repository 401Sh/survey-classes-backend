import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EnrollmentsController } from "./controllers/enrollments.controller"
import { EnrollmentEntity } from "./entities/enrollment.entity"
import { ManageEnrollmentsController } from "./controllers/manage-enrollments.controller"
import { EnrollmentsService } from "./services/enrollments.service"
import { ManageEnrollmentsService } from "./services/manage-enrollments.service"
import { UsersModule } from "src/users/users.module"
import { LessonsModule } from "src/lessons/lessons.module"
import { EnrollmentsInternalService } from "./services/enrollments-internal.service"
import { SubscriptionsModule } from "src/subscriptions/subscriptions.module"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EnrollmentEntity,
        ]),
        UsersModule,
        LessonsModule,
        SubscriptionsModule,
    ],
    controllers: [
        EnrollmentsController,
        ManageEnrollmentsController,
    ],
    providers: [
        EnrollmentsService,
        ManageEnrollmentsService,
        EnrollmentsInternalService,
    ],
    exports: [EnrollmentsInternalService],
})
export class EnrollmentsModule {}