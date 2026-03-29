import { Module } from "@nestjs/common"
import { ApplicationsController } from "./controllers/applications.controller"
import { ApplicationsService } from "./services/applications.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApplicationEntity } from "./entities/application.entity"
import { AnswerEntity } from "./entities/answer.entity"
import { EnrollmentEntity } from "./entities/enrollment.entity"
import { ManageApplicationsService } from "./services/manage-applications.service"
import { ManageApplicationsController } from "./controllers/manage-applications.controller"
import { ManageEnrollmentsController } from "./controllers/manage-enrollments.controller"
import { ManageEnrollmentsService } from "./services/manage-enrollments.service"
import { LessonPricingTierEntity } from "src/lessons/entities/lesson-pricing-tier.entity"
import { UserChildEntity } from "src/users/entities/user-child.entity"
import { AttendanceEntity } from "./entities/attendance.entity"
import { ManageAttendancesController } from "./controllers/manage-attendances.controller"
import { ManageAttendancesService } from "./services/manage-attendances.service"
import { QuestionEntity } from "src/surveys/entities/question.entity"
import { EnrollmentsController } from "./controllers/enrollments.controller"
import { EnrollmentsService } from "./services/enrollments.service"
import { SubscriptionEntity } from "./entities/subscription.entity"
import { ManageSubscriptionsController } from "./controllers/manage-subscriptions.controller"
import { ManageSubscriptionsService } from "./services/manage-subscriptions.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ApplicationEntity,
            AnswerEntity,
            QuestionEntity,
            EnrollmentEntity,
            SubscriptionEntity,
            AttendanceEntity,
            LessonPricingTierEntity,
            UserChildEntity,
        ]),
    ],
    controllers: [
        ApplicationsController,
        EnrollmentsController,
        ManageApplicationsController,
        ManageEnrollmentsController,
        ManageAttendancesController,
        ManageSubscriptionsController,
    ],
    providers: [
        ApplicationsService,
        EnrollmentsService,
        ManageApplicationsService,
        ManageEnrollmentsService,
        ManageAttendancesService,
        ManageSubscriptionsService,
    ],
})
export class ApplicationsModule {}