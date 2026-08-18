import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { LessonEntity } from "../entities/lesson.entity"
import {
    CreateLessonBodyDto,
    CreatePricingTierBodyDto,
    CreateScheduleOverrideBodyDto,
    CreateWeeklySlotBodyDto,
    GetManageLessonListQueryDto,
    GetManagePricingTierQueryDto,
    GetManageScheduleOverrideQueryDto,
    GetWeeklySlotQueryDto,
    UpdateLessonBodyDto
} from "../dto"

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