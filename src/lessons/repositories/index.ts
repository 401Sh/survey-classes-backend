import { Provider } from "@nestjs/common"
import { TypeOrmLessonImageRepository } from "./typeorm-lesson-image.repository"
import { TypeOrmLessonRepository } from "./typeorm-lesson.repository"
import { TypeOrmPricingTierRepository } from "./typeorm-pricing-tier.repository"
import { TypeOrmScheduleOverrideRepository } from "./typeorm-schedule-override.repository"
import { TypeOrmWeeklySlotRepository } from "./typeorm-weekly-slot.repository"
import { LessonImageRepository } from "../abstracts/lesson-image-repository.abstract"
import { LessonRepository } from "../abstracts/lesson-repository.abstract"
import { PricingTierRepository } from "../abstracts/pricing-tier-repository.abstract"
import { ScheduleOverrideRepository } from "../abstracts/schedule-override-repository.abstract"
import { WeeklySlotRepository } from "../abstracts/weekly-slot-repository.abstract"

export const LESSON_REPOSITORY_PROVIDERS: Provider[] = [
    {
        provide: LessonRepository,
        useClass: TypeOrmLessonRepository,
    },
    {
        provide: WeeklySlotRepository,
        useClass: TypeOrmWeeklySlotRepository,
    },
    {
        provide: ScheduleOverrideRepository,
        useClass: TypeOrmScheduleOverrideRepository,
    },
    {
        provide: PricingTierRepository,
        useClass: TypeOrmPricingTierRepository,
    },
    {
        provide: LessonImageRepository,
        useClass: TypeOrmLessonImageRepository,
    },
];