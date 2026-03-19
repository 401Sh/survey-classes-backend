import { Module } from "@nestjs/common"
import { LessonsController } from "./lessons.controller"
import { LessonsService } from "./lessons.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { LessonEntity } from "./entities/lesson.entity"
import { LessonScheduleEntity } from "./entities/lesson-schedule.entity"
import { LessonPricingTierEntity } from "./entities/lesson-pricing-tier.entity"
import { AttendanceEntity } from "./entities/attendance.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            LessonEntity,
            LessonScheduleEntity,
            LessonPricingTierEntity,
            AttendanceEntity,
        ]),
    ],
    controllers: [LessonsController],
    providers: [LessonsService],
    exports: [LessonsService],
})
export class LessonsModule {}