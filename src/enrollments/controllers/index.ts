import { Type } from "@nestjs/common"
import { EnrollmentsController } from "./enrollments.controller"
import { ManageAttendancesController } from "./manage-attendances.controller"
import { ManageEnrollmentsController } from "./manage-enrollments.controller"
import { ManageSubscriptionsController } from "./manage-subscriptions.controller"

export const ENROLLMENT_CONTROLLERS: Type<any>[] = [
    EnrollmentsController,
    ManageEnrollmentsController,
    ManageSubscriptionsController,
    ManageAttendancesController,
]