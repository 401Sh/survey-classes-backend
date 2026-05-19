import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { LessonEntity } from "../entities/lesson.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm"
import { GetLessonListQueryDto } from "../dto/get-lesson-list-query.dto"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { GetScheduleOverrideQueryDto } from "../dto/get-schedule-override-query.dto"
import { ILessonsService } from "../interfaces/lessons-service.interface"

@Injectable()
export class LessonsService implements ILessonsService {
    private readonly logger = new Logger(LessonsService.name)

    constructor(
        @InjectRepository(LessonEntity)
        private lessonRepository: Repository<LessonEntity>,
        @InjectRepository(LessonPricingTierEntity)
        private pricingTierRepository: Repository<LessonPricingTierEntity>,
        @InjectRepository(LessonWeeklySlotEntity)
        private weeklySlotRepository: Repository<LessonWeeklySlotEntity>,
        @InjectRepository(LessonScheduleOverrideEntity)
        private scheduleOverrideRepository: Repository<LessonScheduleOverrideEntity>,
    ) {}

    async findAll(query: GetLessonListQueryDto) {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            search,
            minAge,
            sortDirection,
            categoryId,
            priceFrom,
            priceTo,
        } = query

        const queryBuilder = this.lessonRepository.createQueryBuilder("lessons")

        queryBuilder.leftJoinAndSelect("lessons.pricingTiers", "pricingTiers", "pricingTiers.isActive = true")
        queryBuilder.leftJoinAndSelect("lessons.coverImage", "coverImage")
        queryBuilder.leftJoinAndSelect("lessons.categories", "categories")

        queryBuilder.where("lessons.isActive = true")

        if (search) {
            queryBuilder.andWhere(
                "(lessons.name LIKE :search OR lessons.description LIKE :search)",
                { search: `%${search}%` },
            )
        }

        if (minAge) {
            queryBuilder.andWhere("lessons.minAge >= :minAge", { minAge })
        }

        if (categoryId) {
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


    async findById(id: number): Promise<LessonEntity>{
        const lesson = await this.lessonRepository.findOne({
            where: { 
                id, 
                isActive: true,
                pricingTiers: {
                    isActive: true,
                },
            },
            relations: {
                images: true,
                categories: true,
                pricingTiers: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                minAge: true,
                teacher: true,
                startsAt: true,
                endsAt: true,
                images: {
                    id: true,
                    path: true,
                    position: true,
                },
                categories: {
                    id: true,
                    name: true,
                },
                pricingTiers: {
                    id: true,
                    label: true,
                    price: true,
                    sessionsCount: true,
                    isActive: true,
                },
            },
        })
    
        if (!lesson) {
            this.logger.log(`No lesson with id: ${id}`)
            throw new NotFoundException(`Lesson with id ${id} not found`)
        }
   
        this.logger.log(`Finded lesson with id: ${id}`)
        return lesson
    }


    async findSchedulesByLessonId(lessonId: number, query: GetScheduleOverrideQueryDto) {
        const { dateFrom, dateTo } = query

        const dateFilter = dateFrom && dateTo
            ? Between(dateFrom, dateTo)
            : dateFrom
            ? MoreThanOrEqual(dateFrom)
            : dateTo
            ? LessThanOrEqual(dateTo)
            : undefined

        const [weeklySlots, overrides] = await Promise.all([
            this.weeklySlotRepository.find({
                where: {
                    lesson: {
                        id: lessonId,
                    },
                    isActive: true,
                },
                select: {
                    id: true,
                    dayOfWeek: true,
                    startTime: true,
                    durationMinutes: true,
                    address: true,
                },
                order: {
                    dayOfWeek: SortDirection.ASC,
                },
            }),
            this.scheduleOverrideRepository.find({
                where: {
                    lesson: {
                        id: lessonId,
                    },
                    date: dateFilter,
                },
                select: {
                    id: true,
                    date: true,
                    startTime: true,
                    address: true,
                    status: true,
                    note: true,
                },
                order: {
                    date: SortDirection.ASC,
                },
            }),
        ])

        return { weeklySlots, overrides }
    }


    async findPricingTiersByLessonId(lessonId: number) {
        const pricingTiers = await this.pricingTierRepository.find({
            where: {
                lesson: {
                    id: lessonId,
                },
                isActive: true,
            },
            select: {
                id: true,
                label: true,
                price: true,
                sessionsCount: true,
            },
        })

        return pricingTiers
    }
}