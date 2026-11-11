import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { CategoryEntity } from "src/dictionaries/entities/category.entity"
import { ManageDictionariesService } from "src/dictionaries/services/manage-dictionaries.service"
import { IManageLessonsService } from "../interfaces/manage-lessons-service.interface"
import {
    CreateLessonBodyDto,
    CreatePricingTierBodyDto,
    CreateWeeklySlotBodyDto,
    CreateScheduleOverrideBodyDto,
    GetManageLessonListQueryDto,
    GetManagePricingTierQueryDto,
    GetWeeklySlotQueryDto,
    GetManageScheduleOverrideQueryDto,
    UpdateLessonBodyDto
} from "../dto"
import { LessonRepository } from "../abstracts/lesson-repository.abstract"
import { PricingTierRepository } from "../abstracts/pricing-tier-repository.abstract"
import { WeeklySlotRepository } from "../abstracts/weekly-slot-repository.abstract"
import { ScheduleOverrideRepository } from "../abstracts/schedule-override-repository.abstract"

@Injectable()
export class ManageLessonsService implements IManageLessonsService {
    private readonly logger = new Logger(ManageLessonsService.name)

    constructor(
        private readonly lessonRepository: LessonRepository,
        private readonly weeklySlotRepository: WeeklySlotRepository,
        private readonly scheduleOverrideRepository: ScheduleOverrideRepository,
        private readonly pricingTierRepository: PricingTierRepository,

        private readonly manageDictionariesService: ManageDictionariesService,
    ) {}

    async create(userId: number, data: CreateLessonBodyDto) {
        const { categoryIds, ...lessonData } = data

        let categories: CategoryEntity[] = []
        if (categoryIds && categoryIds.length > 0) {
            categories = await this.manageDictionariesService.findCategoriesByIds(categoryIds)
        }

        const lesson = await this.lessonRepository.create(userId, lessonData, categories)

        this.logger.log(`Created new lesson for user: ${userId}`)
        this.logger.debug("Created new lesson: ", lesson)
        return lesson
    }


    async createPricingTier(lessonId: number, data: CreatePricingTierBodyDto) {
        // check that lesson exists
        await this.validateLessonExists(lessonId)

        const pricingTier = await this.pricingTierRepository.create(lessonId, data)

        this.logger.log(`Created new pricing tier override for lesson: ${lessonId}`)
        this.logger.debug("Created new pricing tier override: ", pricingTier)
        return pricingTier
    }


    async createWeeklySlots(lessonId: number, data: CreateWeeklySlotBodyDto) {
        const { daysOfWeek, ...slotData } = data

        // check that lesson exists
        await this.validateLessonExists(lessonId)

        // check date + time dublication
        const existingSlots = await this.weeklySlotRepository.findDuplicates(
            lessonId,
            daysOfWeek,
            slotData.startTime,
        )

        if (existingSlots.length > 0) {
            const duplicateDays = existingSlots.map(s => s.dayOfWeek).join(", ")
            throw new ConflictException(
                `Weekly slots for days [${duplicateDays}] at ${slotData.startTime} already exist`
            )
        }

        const savedWeeklySlots = await this.weeklySlotRepository.createMany(lessonId, slotData, daysOfWeek)

        this.logger.log(`Created ${savedWeeklySlots.length} new weekly slots for lesson: ${lessonId}`)
        this.logger.debug("Created new weekly slots: ", savedWeeklySlots)
        return savedWeeklySlots
    }


    async createScheduleOverride(lessonId: number, data: CreateScheduleOverrideBodyDto) {
        // check that lesson exists
        await this.validateLessonExists(lessonId)

        const scheduleOverride = await this.scheduleOverrideRepository.create(lessonId, data)

        this.logger.log(`Created new schedule override for lesson: ${lessonId}`)
        this.logger.debug("Created new schedule override: ", scheduleOverride)
        return scheduleOverride
    }


    async findAll(query: GetManageLessonListQueryDto) {
        const [lessons, totalCount] = await this.lessonRepository.findPage(query)
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


    async findById(id: number) {
        const lesson = await this.lessonRepository.findByIdWithDetails(id)

        if (!lesson) {
            this.logger.log(`No lesson with id: ${id}`)
            throw new NotFoundException(`Lesson with id ${id} not found`)
        }

        this.logger.log(`Finded lesson with id: ${id}`)
        this.logger.debug("Get lesson: ", lesson)
        return lesson
    }


    async findAllPricingTiersByLessonId(lessonId: number, query: GetManagePricingTierQueryDto) {
        const { isActive } = query

        // check that lesson exists
        await this.validateLessonExists(lessonId)

        const pricingTiers = await this.pricingTierRepository.findAllByLessonId(lessonId, isActive)

        this.logger.log(`Finded pricing tiers for lesson with id: ${lessonId}`)
        this.logger.debug("Get pricing tiers list: ", pricingTiers)
        return pricingTiers
    }


    async findAllWeeklySlotsByLessonId(lessonId: number, query: GetWeeklySlotQueryDto) {
        // check that lesson exists
        await this.validateLessonExists(lessonId)

        const weeklySlots = await this.weeklySlotRepository.findAllByLessonId(lessonId, query)

        this.logger.log(`Finded weekly slots for lesson with id: ${lessonId}`)
        this.logger.debug("Get weekly slots list: ", weeklySlots)
        return weeklySlots
    }


    async findAllScheduleOverridesByLessonId(lessonId: number, query: GetManageScheduleOverrideQueryDto) {
        // check that lesson exists
        await this.validateLessonExists(lessonId)

        const scheduleOverrides = await this.scheduleOverrideRepository.findAllByLessonId(lessonId, query)

        this.logger.log(`Finded schedule overrides for lesson with id: ${lessonId}`)
        this.logger.debug("Get schedule overrides list: ", scheduleOverrides)
        return scheduleOverrides
    }


    async update(lessonId: number, data: UpdateLessonBodyDto) {
        const { categoryIds, ...otherData } = data

        const lesson = await this.lessonRepository.findByIdWithCategories(lessonId)

        if (!lesson) throw new NotFoundException(`Lesson with id ${lessonId} not found`)

        if (categoryIds !== undefined) {
            lesson.categories = categoryIds.length > 0
                ? await this.manageDictionariesService.findCategoriesByIds(categoryIds)
                : []
        }

        Object.assign(lesson, otherData)
        await this.lessonRepository.save(lesson)

        this.logger.log(`Lesson with id ${lessonId} updated successfully`)
    }


    async delete(lessonId: number) {
        const hasActiveEnrollments = await this.lessonRepository.existsWithActiveEnrollments(lessonId)

        if (hasActiveEnrollments) {
            this.logger.log(`Cannot delete lesson with active enrollments: ${lessonId}`)
            throw new ConflictException("Cannot delete lesson with active enrollments")
        }

        this.logger.log(`Deleting lesson with id: ${lessonId}`)
        const deleteResult = await this.lessonRepository.softDelete(lessonId)

        if (!deleteResult) {
            this.logger.log(`Cannot delete lesson. No lesson with id: ${lessonId}`)
            throw new NotFoundException(`Lesson with id ${lessonId} not found`)
        }
    }


    private async validateLessonExists(lessonId: number) {
        const isLessonExists = await this.lessonRepository.existsById(lessonId)

        if (!isLessonExists) throw new NotFoundException(`Lesson with id ${lessonId} not found`)
    }
}