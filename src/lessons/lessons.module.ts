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
    ],
    providers: [
        LessonsService,
        ManageLessonsService,
    ],
    exports: [LessonsService],
})
export class LessonsModule {}