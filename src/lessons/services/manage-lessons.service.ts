import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { LessonEntity } from "../entities/lesson.entity"
import { In, Repository } from "typeorm"
import { GetManageLessonListQueryDto } from "../dto/get-manage-lesson-list-query.dto"
import { CreateLessonBodyDto } from "../dto/create-lesson-body.dto"
import { UpdateLessonBodyDto } from "../dto/update-lesson-body.dto"
import { CategoryEntity } from "src/dictionaries/entities/category.entity"
import { ManageDictionariesService } from "src/dictionaries/services/manage-dictionaries.service"
import { CreatePricingTierBodyDto } from "../dto/create-pricing-tier-body.dto"
import { CreateScheduleOverrideBodyDto } from "../dto/create-schedule-override-body.dto"
import { CreateWeeklySlotBodyDto } from "../dto/create-weekly-slot-body.dto"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { GetScheduleOverrideQueryDto } from "../dto/get-schedule-override-query.dto"
import { GetWeeklySlotQueryDto } from "../dto/get-weekly-slot-query.dto"
import { GetPricingTierQueryDto } from "../dto/get-pricing-tier-query.dto"
import { SortDirection } from "src/common/enums/sort-direction.enum"

@Injectable()
export class ManageLessonsService {
    private readonly logger = new Logger(ManageLessonsService.name)

    constructor(
        @InjectRepository(LessonEntity)
        private lessonRepository: Repository<LessonEntity>,
        @InjectRepository(LessonPricingTierEntity)
        private pricingTierRepository: Repository<LessonPricingTierEntity>,
        @InjectRepository(LessonWeeklySlotEntity)
        private weeklySlotRepository: Repository<LessonWeeklySlotEntity>,
        @InjectRepository(LessonScheduleOverrideEntity)
        private scheduleOverrideRepository: Repository<LessonScheduleOverrideEntity>,

        private manageDictionariesService: ManageDictionariesService,
    ) {}

    async create(userId: number, data: CreateLessonBodyDto) {
        const { categoryIds, ...lessonData } = data

        let categories: CategoryEntity[] = []
        if (categoryIds && categoryIds.length > 0) {
            categories = await this.manageDictionariesService.findCategoriesByIds(categoryIds)
        }

        const lesson = await this.lessonRepository.save({
            ...lessonData,
            createdBy: { id: userId },
            categories: categories.length ? categories : [],
        })

        this.logger.log(`Created new lesson for user: ${userId}`)
        this.logger.debug("Created new lesson: ", lesson)
        return lesson
    }


    async createPricingTier(lessonId: number, data: CreatePricingTierBodyDto) {
        const isLessonExists = await this.existsById(lessonId)
        if (!isLessonExists) throw new NotFoundException(`Lesson with id ${lessonId} not found`)

        const pricingTier = await this.pricingTierRepository.save({
            ...data,
            lesson: { id: lessonId },
        })

        this.logger.log(`Created new pricing tier override for lesson: ${lessonId}`)
        this.logger.debug("Created new pricing tier override: ", pricingTier)
        return pricingTier
    }


    async createWeeklySlots(lessonId: number, data: CreateWeeklySlotBodyDto) {
        const { daysOfWeek, ...slotData } = data

        const isLessonExists = await this.existsById(lessonId)
        if (!isLessonExists) throw new NotFoundException(`Lesson with id ${lessonId} not found`)

        const slots = daysOfWeek.map(dayOfWeek => ({
            ...slotData,
            dayOfWeek,
            lesson: { id: lessonId },
        }))

        const weeklySlots = await this.weeklySlotRepository.save(slots)

        this.logger.log(`Created new weekly slots for lesson: ${lessonId}`)
        this.logger.debug("Created new weekly slots: ", weeklySlots)
        return weeklySlots
    }


    async createScheduleOverride(lessonId: number, data: CreateScheduleOverrideBodyDto) {
        const isLessonExists = await this.existsById(lessonId)
        if (!isLessonExists) throw new NotFoundException(`Lesson with id ${lessonId} not found`)

        const scheduleOverride = await this.scheduleOverrideRepository.save({
            ...data,
            lesson: { id: lessonId },
        })

        this.logger.log(`Created new schedule override for lesson: ${lessonId}`)
        this.logger.debug("Created new schedule override: ", scheduleOverride)
        return scheduleOverride
    }


    async findAll(query: GetManageLessonListQueryDto) {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            isActive,
            search,
            sortDirection,
            categoryId,
            priceFrom,
            priceTo,
        } = query

        const queryBuilder = this.lessonRepository.createQueryBuilder("lessons")

        queryBuilder.leftJoinAndSelect("lessons.pricingTiers", "pricingTiers")
        queryBuilder.leftJoinAndSelect("lessons.images", "images")
        queryBuilder.leftJoinAndSelect("lessons.categories", "categories")

        if (isActive !== undefined) {
            queryBuilder.where("lessons.isActive = :isActive", { isActive })
        }

        if (search) {
            queryBuilder.andWhere(
                "(lessons.name ILIKE :search OR lessons.description ILIKE :search)",
                { search: `%${search}%` },
            )
        }

        if (categoryId) {
            // TODO: add array query search
            queryBuilder.andWhere("categories.id = :categoryId", { categoryId })
        }

        if (priceFrom) {
            queryBuilder.andWhere("pricingTiers.price >= :priceFrom", { priceFrom })
        }

        if (priceTo) {
            queryBuilder.andWhere("pricingTiers.price <= :priceTo", { priceTo })
        }

        if (dateFrom) {
            queryBuilder.andWhere("lessons.startsAt >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("lessons.endsAt <= :dateTo", { dateTo })
        }

        queryBuilder.orderBy("lessons.startsAt", sortDirection)
        queryBuilder.skip((page - 1) * limit).take(limit)

        const [lessons, totalCount] = await queryBuilder.getManyAndCount()
        const totalPagesAmount = Math.ceil(totalCount / limit)

        this.logger.debug("Get lessons list: ", lessons)
        return {
            data: lessons,
            meta: {
                totalCount: totalCount,
                totalPagesAmount: totalPagesAmount,
                currentPage: page,
            }
        }
    }


    async findById(id: number) {
        const lesson = await this.lessonRepository.findOne({
            where: { id },
            relations: {
                images: true,
                categories: true,
                pricingTiers: true,
                weeklySlots: true,
                scheduleOverrides: true,
            },
        })
        
        if (!lesson) {
            this.logger.log(`No lesson with id: ${id}`)
            throw new NotFoundException(`Lesson with id ${id} not found`)
        }
    
        this.logger.log(`Finded lesson with id: ${id}`)
        this.logger.debug("Get lesson: ", lesson)
        return lesson
    }


    async existsById(id: number): Promise<boolean> {
        return this.lessonRepository.existsBy({ id })
    }


    async findAllPricingTiersByLessonId(lessonId: number, query: GetPricingTierQueryDto) {
        const { isActive } = query

        const isLessonExists = await this.existsById(lessonId)
        if (!isLessonExists) throw new NotFoundException(`Lesson with id ${lessonId} not found`)

        const pricingTiers = await this.pricingTierRepository.find({
            where: {
                lesson: { id: lessonId },
                isActive,
            },
        })

        this.logger.log(`Finded pricing tiers for lesson with id: ${lessonId}`)
        this.logger.debug("Get pricing tiers list: ", pricingTiers)
        return pricingTiers
    }


    async findAllWeeklySlotsByLessonId(lessonId: number, query: GetWeeklySlotQueryDto) {
        const { isActive, daysOfWeek } = query

        const isLessonExists = await this.existsById(lessonId)
        if (!isLessonExists) throw new NotFoundException(`Lesson with id ${lessonId} not found`)

        const weeklySlots = await this.weeklySlotRepository.find({
            where: {
                lesson: { id: lessonId },
                isActive,
                dayOfWeek: daysOfWeek ? In(daysOfWeek) : undefined,
            },
            order: {
                dayOfWeek: SortDirection.ASC,
            }
        })

        this.logger.log(`Finded weekly slots for lesson with id: ${lessonId}`)
        this.logger.debug("Get weekly slots list: ", weeklySlots)
        return weeklySlots
    }


    async findAllScheduleOverridesByLessonId(lessonId: number, query: GetScheduleOverrideQueryDto) {
        const { status } = query

        const isLessonExists = await this.existsById(lessonId)
        if (!isLessonExists) throw new NotFoundException(`Lesson with id ${lessonId} not found`)

        const scheduleOverrides = await this.scheduleOverrideRepository.find({
            where: {
                lesson: { id: lessonId },
                status,
            },
            order: {
                date: SortDirection.ASC,
            }
        })

        this.logger.log(`Finded schedule overrides for lesson with id: ${lessonId}`)
        this.logger.debug("Get schedule overrides list: ", scheduleOverrides)
        return scheduleOverrides
    }


    async update(lessonId: number, data: UpdateLessonBodyDto) {
        const { categoryIds, ...otherData } = data

        const lesson = await this.lessonRepository.findOne({
            where: { id: lessonId },
            relations: { categories: true },
        })
    
        if (!lesson) throw new NotFoundException(`Lesson with id ${lessonId} not found`)
    
        if (categoryIds !== undefined) {
            lesson.categories = categoryIds.length > 0
                ? await this.manageDictionariesService.findCategoriesByIds(categoryIds)
                : []
        }
    
        Object.assign(lesson, otherData)
        const updatedLesson = await this.lessonRepository.save(lesson)

        this.logger.log(`Lesson with id ${lessonId} updated successfully`)
        return updatedLesson 
    }


    async delete(lessonId: number) {
        this.logger.log(`Deleting lesson with id: ${lessonId}`)
        const deleteResult = await this.lessonRepository.delete({ id: lessonId })

        if (deleteResult.affected === 0) {
            this.logger.log(`Cannot delete lesson. No lesson with id: ${lessonId}`)
            throw new NotFoundException(`Lesson with id ${lessonId} not found`)
        }

        return deleteResult
    }
}