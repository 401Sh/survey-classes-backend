import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { GetLessonListQueryDto } from "../dto/get-lesson-list-query.dto"
import { GetScheduleOverrideQueryDto } from "../dto/get-schedule-override-query.dto"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { LessonEntity } from "../entities/lesson.entity"
import { LessonSchedules } from "./lesson-shedules.interface"

export interface ILessonsService {
    findAll(query: GetLessonListQueryDto): Promise<PaginatedResult<LessonEntity>>
    findById(id: number): Promise<LessonEntity>
    findSchedulesByLessonId(lessonId: number, query: GetScheduleOverrideQueryDto): Promise<LessonSchedules>
    findPricingTiersByLessonId(lessonId: number): Promise<LessonPricingTierEntity[]>
}