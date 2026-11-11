import { Module } from "@nestjs/common"
import { LessonsController } from "./controllers/lessons.controller"
import { LessonsService } from "./services/lessons.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { LessonEntity } from "./entities/lesson.entity"
import { LessonPricingTierEntity } from "./entities/lesson-pricing-tier.entity"
import { LessonWeeklySlotEntity } from "./entities/lesson-weekly-slot.entity"
import { LessonScheduleOverrideEntity } from "./entities/lesson-schedule-override.entity"
import { DictionariesModule } from "src/dictionaries/dictionaries.module"
import { ManageLessonsController } from "./controllers/manage-lessons.controller"
import { ManageLessonsService } from "./services/manage-lessons.service"
import { ManagePricingTiersService } from "./services/manage-pricing-tiers.service"
import { ManageWeeklySlotsService } from "./services/manage-weekly-slots.service"
import { ManageScheduleOverridesService } from "./services/manage-schedule-overrides.service"
import { ManagePricingTiersController } from "./controllers/manage-pricing-tiers.controller"
import { ManageWeeklySlotsController } from "./controllers/manage-weekly-slots.controller"
import { ManageScheduleOverridesController } from "./controllers/manage-schedule-overrides.controller"
import { LessonsInternalService } from "./services/lessons-internal.service"
import { LessonPricingTiersInternalService } from "./services/lesson-pricing-tiers-internal.service"
import { MediaModule } from "src/media/media.module"
import { ManageLessonImagesService } from "./services/manage-lesson-images.service"
import { ManageLessonImagesController } from "./controllers/manage-lesson-images.controller"
import { LessonImageEntity } from "./entities/lesson-image.entity"
import { TypeOrmLessonRepository } from "./repositories/typeorm-lesson.repository"
import { LessonRepository } from "./abstracts/lesson-repository.abstract"
import { PricingTierRepository } from "./abstracts/pricing-tier-repository.abstract"
import { TypeOrmPricingTierRepository } from "./repositories/typeorm-pricing-tier.repository"
import { WeeklySlotRepository } from "./abstracts/weekly-slot-repository.abstract"
import { TypeOrmWeeklySlotRepository } from "./repositories/typeorm-weekly-slot.repository"
import { LessonImageRepository } from "./abstracts/lesson-image-repository.abstract"
import { ScheduleOverrideRepository } from "./abstracts/schedule-override-repository.abstract"
import { TypeOrmScheduleOverrideRepository } from "./repositories/typeorm-schedule-override.repository"
import { TypeOrmLessonImageRepository } from "./repositories/typeorm-lesson-image.repository"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            LessonEntity,
            LessonPricingTierEntity,
            LessonWeeklySlotEntity,
            LessonScheduleOverrideEntity,
            LessonImageEntity,
        ]),
        DictionariesModule,
        MediaModule,
    ],
    controllers: [
        LessonsController,
        ManageLessonsController,
        ManagePricingTiersController,
        ManageWeeklySlotsController,
        ManageScheduleOverridesController,
        ManageLessonImagesController,
    ],
    providers: [
        LessonsService,
        ManageLessonsService,
        ManagePricingTiersService,
        ManageWeeklySlotsService,
        ManageScheduleOverridesService,
        LessonsInternalService,
        LessonPricingTiersInternalService,
        ManageLessonImagesService,
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
    ],
    exports: [
        LessonsInternalService,
        LessonPricingTiersInternalService,
    ],
})
export class LessonsModule {}