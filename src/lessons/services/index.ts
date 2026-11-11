import { Provider } from "@nestjs/common"
import { LessonPricingTiersInternalService } from "./lesson-pricing-tiers-internal.service"
import { LessonsInternalService } from "./lessons-internal.service"
import { LessonsService } from "./lessons.service"
import { ManageLessonImagesService } from "./manage-lesson-images.service"
import { ManageLessonsService } from "./manage-lessons.service"
import { ManagePricingTiersService } from "./manage-pricing-tiers.service"
import { ManageScheduleOverridesService } from "./manage-schedule-overrides.service"
import { ManageWeeklySlotsService } from "./manage-weekly-slots.service"

export const LESSON_SERVICES: Provider[] = [
    LessonsService,
    ManageLessonsService,
    ManagePricingTiersService,
    ManageWeeklySlotsService,
    ManageScheduleOverridesService,
    LessonsInternalService,
    LessonPricingTiersInternalService,
    ManageLessonImagesService,
]