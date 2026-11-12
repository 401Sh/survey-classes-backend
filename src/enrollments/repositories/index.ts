import { Provider } from "@nestjs/common"
import { AttendanceRepository } from "../abstracts/attendance-repository.abstract"
import { EnrollmentRepository } from "../abstracts/enrollment-repository.abstract"
import { SubscriptionRepository } from "../abstracts/subscription-repository.abstract"
import { TypeOrmAttendanceRepository } from "./typeorm-attendance.repository"
import { TypeOrmEnrollmentRepository } from "./typeorm-enrollment.repository"
import { TypeOrmSubscriptionRepository } from "./typeorm-subscription.repository"

export const ENROLLMENT_REPOSITORY_PROVIDERS: Provider[] = [
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
]