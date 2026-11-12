import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EnrollmentsController } from "./controllers/enrollments.controller"
import { EnrollmentEntity } from "./entities/enrollment.entity"
import { ManageEnrollmentsController } from "./controllers/manage-enrollments.controller"
import { EnrollmentsService } from "./services/enrollments.service"
import { ManageEnrollmentsService } from "./services/manage-enrollments.service"
import { UsersModule } from "src/users/users.module"
import { LessonsModule } from "src/lessons/lessons.module"
import { AttendanceEntity } from "./entities/attendance.entity"
import { SubscriptionEntity } from "./entities/subscription.entity"
import { ManageSubscriptionsController } from "./controllers/manage-subscriptions.controller"
import { ManageAttendancesController } from "./controllers/manage-attendances.controller"
import { ManageSubscriptionsService } from "./services/manage-subscriptions.service"
import { ManageAttendancesService } from "./services/manage-attendances.service"
import { EnrollmentRepository } from "./abstracts/enrollment-repository.abstract"
import { TypeOrmEnrollmentRepository } from "./repositories/typeorm-enrollment.repository"
import { SubscriptionRepository } from "./abstracts/subscription-repository.abstract"
import { TypeOrmSubscriptionRepository } from "./repositories/typeorm-subscription.repository"
import { AttendanceRepository } from "./abstracts/attendance-repository.abstract"
import { TypeOrmAttendanceRepository } from "./repositories/typeorm-attendance.repository"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EnrollmentEntity,
            SubscriptionEntity,
            AttendanceEntity,
        ]),
        UsersModule,
        LessonsModule,
    ],
    controllers: [
        EnrollmentsController,
        ManageEnrollmentsController,
        ManageSubscriptionsController,
        ManageAttendancesController,
    ],
    providers: [
        EnrollmentsService,
        ManageEnrollmentsService,
        ManageSubscriptionsService,
        ManageAttendancesService,
        {
            provide: EnrollmentRepository,
            useClass: TypeOrmEnrollmentRepository,
        },
        {
            provide: SubscriptionRepository,
            useClass: TypeOrmSubscriptionRepository,
        },
        {
            provide: AttendanceRepository,
            useClass: TypeOrmAttendanceRepository,
        },
    ],
})
export class EnrollmentsModule {}