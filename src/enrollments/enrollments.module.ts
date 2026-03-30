import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EnrollmentsController } from "./controllers/enrollments.controller"
import { EnrollmentEntity } from "./entities/enrollment.entity"
import { ManageEnrollmentsController } from "./controllers/manage-enrollments.controller"
import { EnrollmentsService } from "./services/enrollments.service"
import { ManageEnrollmentsService } from "./services/manage-enrollments.service"
import { SubscriptionEntity } from "src/subscriptions/entities/subscription.entity"
import { LessonEntity } from "src/lessons/entities/lesson.entity"
import { LessonPricingTierEntity } from "src/lessons/entities/lesson-pricing-tier.entity"
import { UsersModule } from "src/users/users.module"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EnrollmentEntity,
            SubscriptionEntity,
            LessonEntity,
            LessonPricingTierEntity,
        ]),
        UsersModule,
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