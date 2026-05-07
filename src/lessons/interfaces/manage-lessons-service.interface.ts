import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { CreateLessonBodyDto } from "../dto/create-lesson-body.dto"
import { CreatePricingTierBodyDto } from "../dto/create-pricing-tier-body.dto"
import { CreateScheduleOverrideBodyDto } from "../dto/create-schedule-override-body.dto"
import { CreateWeeklySlotBodyDto } from "../dto/create-weekly-slot-body.dto"
import { GetManageLessonListQueryDto } from "../dto/get-manage-lesson-list-query.dto"
import { GetManagePricingTierQueryDto } from "../dto/get-manage-pricing-tier-query.dto"
import { GetManageScheduleOverrideQueryDto } from "../dto/get-manage-schedule-override-query.dto"
import { GetWeeklySlotQueryDto } from "../dto/get-weekly-slot-query.dto"
import { UpdateLessonBodyDto } from "../dto/update-lesson-body.dto"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { LessonEntity } from "../entities/lesson.entity"

export interface IManageLessonsService {
    create(userId: number, data: CreateLessonBodyDto): Promise<LessonEntity>
    createPricingTier(lessonId: number, data: CreatePricingTierBodyDto): Promise<LessonPricingTierEntity>
    createWeeklySlots(lessonId: number, data: CreateWeeklySlotBodyDto): Promise<LessonWeeklySlotEntity[]>
    createScheduleOverride(lessonId: number, data: CreateScheduleOverrideBodyDto): Promise<LessonScheduleOverrideEntity>
    findAll(query: GetManageLessonListQueryDto): Promise<PaginatedResult<LessonEntity>>
    findById(id: number): Promise<LessonEntity>
    findAllPricingTiersByLessonId(
        lessonId: number,
        query: GetManagePricingTierQueryDto,
    ): Promise<LessonPricingTierEntity[]>
    findAllWeeklySlotsByLessonId(lessonId: number, query: GetWeeklySlotQueryDto): Promise<LessonWeeklySlotEntity[]>
    findAllScheduleOverridesByLessonId(
        lessonId: number,
        query: GetManageScheduleOverrideQueryDto,
    ): Promise<LessonScheduleOverrideEntity[]>
    update(lessonId: number, data: UpdateLessonBodyDto): Promise<void>
    delete(lessonId: number): Promise<void>
}