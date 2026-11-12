import { Provider } from "@nestjs/common"
import { EnrollmentsService } from "./enrollments.service"
import { ManageAttendancesService } from "./manage-attendances.service"
import { ManageEnrollmentsService } from "./manage-enrollments.service"
import { ManageSubscriptionsService } from "./manage-subscriptions.service"

export const ENROLLMENT_SERVICES: Provider[] = [
    EnrollmentsService,
    ManageEnrollmentsService,
    ManageSubscriptionsService,
    ManageAttendancesService,
]