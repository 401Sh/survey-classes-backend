import { Module } from "@nestjs/common"
import { LessonsController } from "./controllers/lessons.controller"
import { LessonsService } from "./services/lessons.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { LessonEntity } from "./entities/lesson.entity"
import { LessonPricingTierEntity } from "./entities/lesson-pricing-tier.entity"
import { LessonWeeklySlotEntity } from "./entities/lesson-weekly-slot.entity"
import { LessonScheduleOverrideEntity } from "./entities/lesson-schedule-override.entity"
import { AttendanceEntity } from "./entities/attendance.entity"
import { DictionariesModule } from "src/dictionaries/dictionaries.module"
import { ManageLessonsController } from "./controllers/manage-lessons.controller"
import { ManageLessonsService } from "./services/manage-lessons.service"
import { ManagePricingTiersService } from "./services/manage-pricing-tiers.service"
import { ManageWeeklySlotsService } from "./services/manage-weekly-slots.service"
import { ManageScheduleOverridesService } from "./services/manage-schedule-overrides.service"
import { ManagePricingTiersController } from "./controllers/manage-pricing-tiers.controller"
import { ManageWeeklySlotsController } from "./controllers/manage-weekly-slots.controller"
import { ManageScheduleOverridesController } from "./controllers/manage-schedule-overrides.controller"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            LessonEntity,
            LessonPricingTierEntity,
            LessonWeeklySlotEntity,
            LessonScheduleOverrideEntity,
            AttendanceEntity,
        ]),
        DictionariesModule,
    ],
    controllers: [
        LessonsController,
        ManageLessonsController,
        ManagePricingTiersController,
        ManageWeeklySlotsController,
        ManageScheduleOverridesController,
    ],
    providers: [
        LessonsService,
        ManageLessonsService,
        ManagePricingTiersService,
        ManageWeeklySlotsService,
        ManageScheduleOverridesService,
    ],
    exports: [LessonsService],
})
export class LessonsModule {}