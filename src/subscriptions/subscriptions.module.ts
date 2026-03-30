import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SubscriptionEntity } from "./entities/subscription.entity"
import { AttendanceEntity } from "./entities/attendance.entity"
import { ManageSubscriptionsController } from "./controllers/manage-subscriptions.controller"
import { ManageAttendancesController } from "./controllers/manage-attendances.controller"
import { ManageSubscriptionsService } from "./services/manage-subscriptions.service"
import { ManageAttendancesService } from "./services/manage-attendances.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SubscriptionEntity,
            AttendanceEntity,
        ]),
    ],
    controllers: [
        ManageSubscriptionsController,
        ManageAttendancesController,
    ],
    providers: [
        ManageSubscriptionsService,
        ManageAttendancesService,
    ],
})
export class SubscriptionsModule {}