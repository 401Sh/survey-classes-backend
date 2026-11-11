import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { LessonEntity } from "../entities/lesson.entity"
import { ILessonsService } from "../interfaces/lessons-service.interface"
import { GetLessonListQueryDto, GetScheduleOverrideQueryDto } from "../dto"
import { LessonRepository } from "../abstracts/lesson-repository.abstract"
import { PricingTierRepository } from "../abstracts/pricing-tier-repository.abstract"
import { WeeklySlotRepository } from "../abstracts/weekly-slot-repository.abstract"
import { ScheduleOverrideRepository } from "../abstracts/schedule-override-repository.abstract"

@Injectable()
export class LessonsService implements ILessonsService {
    private readonly logger = new Logger(LessonsService.name)

    constructor(
        private readonly lessonRepository: LessonRepository,
        private readonly weeklySlotRepository: WeeklySlotRepository,
        private readonly scheduleOverrideRepository: ScheduleOverrideRepository,
        private readonly pricingTierRepository: PricingTierRepository,
    ) {}

    async findAll(query: GetLessonListQueryDto) {
        const [lessons, totalCount] = await this.lessonRepository.findActivePage(query)
        const totalPagesAmount = Math.ceil(totalCount / query.limit)

        this.logger.debug("Get lessons list: ", lessons)
        return {
            data: lessons,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: query.page,
            }
        }
    }


    async findById(id: number): Promise<LessonEntity>{
        const lesson = await this.lessonRepository.findActiveByIdWithDetails(id)
    
        if (!lesson) {
            this.logger.log(`No lesson with id: ${id}`)
            throw new NotFoundException(`Lesson with id ${id} not found`)
        }
   
        this.logger.log(`Finded lesson with id: ${id}`)
        return lesson
    }


    async findSchedulesByLessonId(lessonId: number, query: GetScheduleOverrideQueryDto) {
        const { dateFrom, dateTo } = query

        const [weeklySlots, overrides] = await Promise.all([
            this.weeklySlotRepository.findActiveByLessonId(lessonId),
            this.scheduleOverrideRepository.findPublicByLessonId(lessonId, dateFrom, dateTo),
        ])

        return { weeklySlots, overrides }
    }


    async findPricingTiersByLessonId(lessonId: number) {
        const pricingTiers = await this.pricingTierRepository.findActiveByLessonId(lessonId)

        return pricingTiers
    }
}