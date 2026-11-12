import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EnrollmentEntity } from "./entities/enrollment.entity"
import { UsersModule } from "src/users/users.module"
import { LessonsModule } from "src/lessons/lessons.module"
import { AttendanceEntity } from "./entities/attendance.entity"
import { SubscriptionEntity } from "./entities/subscription.entity"
import { ENROLLMENT_SERVICES } from "./services"
import { ENROLLMENT_REPOSITORY_PROVIDERS } from "./repositories"
import { ENROLLMENT_CONTROLLERS } from "./controllers"

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
    controllers: ENROLLMENT_CONTROLLERS,
    providers: [
        ...ENROLLMENT_SERVICES,
        ...ENROLLMENT_REPOSITORY_PROVIDERS,
    ],
})
export class EnrollmentsModule {}