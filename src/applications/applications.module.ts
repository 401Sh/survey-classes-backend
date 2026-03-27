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

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ApplicationEntity,
            AnswerEntity,
            EnrollmentEntity,
            AttendanceEntity,
            LessonPricingTierEntity,
            UserChildEntity,
        ]),
    ],
    controllers: [
        ApplicationsController,
        ManageApplicationsController,
        ManageEnrollmentsController,
    ],
    providers: [
        ApplicationsService,
        ManageApplicationsService,
        ManageEnrollmentsService,
    ],
})
export class ApplicationsModule {}