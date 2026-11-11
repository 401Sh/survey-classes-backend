import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"
import { LessonImageEntity } from "./lesson-image.entity"
import { LessonPricingTierEntity } from "./lesson-pricing-tier.entity"
import { LessonScheduleOverrideEntity } from "./lesson-schedule-override.entity"
import { LessonWeeklySlotEntity } from "./lesson-weekly-slot.entity"
import { LessonEntity } from "./lesson.entity"

export const LESSON_ENTITIES: EntityClassOrSchema[] = [
    LessonEntity,
    LessonPricingTierEntity,
    LessonWeeklySlotEntity,
    LessonScheduleOverrideEntity,
    LessonImageEntity,
]