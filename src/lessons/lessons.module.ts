import { Module } from "@nestjs/common"
import { LessonsController } from "./controllers/lessons.controller"
import { LessonsService } from "./services/lessons.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { LessonEntity } from "./entities/lesson.entity"
import { LessonScheduleEntity } from "./entities/lesson-schedule.entity"
import { LessonPricingTierEntity } from "./entities/lesson-pricing-tier.entity"
import { AttendanceEntity } from "./entities/attendance.entity"
import { DictionariesModule } from "src/dictionaries/dictionaries.module"
import { ManageLessonsController } from "./controllers/manage-lessons.controller"
import { ManageLessonsService } from "./services/manage-lessons.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            LessonEntity,
            LessonScheduleEntity,
            LessonPricingTierEntity,
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