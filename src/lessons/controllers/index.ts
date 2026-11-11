import { Type } from "@nestjs/common/interfaces"
import { LessonsController } from "./lessons.controller"
import { ManageLessonsController } from "./manage-lessons.controller"
import { ManageLessonImagesController } from "./manage-lesson-images.controller"
import { ManagePricingTiersController } from "./manage-pricing-tiers.controller"
import { ManageScheduleOverridesController } from "./manage-schedule-overrides.controller"
import { ManageWeeklySlotsController } from "./manage-weekly-slots.controller"

export const LESSON_CONTROLLERS: Type<any>[] = [
    LessonsController,
    ManageLessonsController,
    ManagePricingTiersController,
    ManageWeeklySlotsController,
    ManageScheduleOverridesController,
    ManageLessonImagesController,
]