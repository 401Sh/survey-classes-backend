import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { LessonEntity } from "./entities/lesson.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { GetLessonListQueryDto } from "./dto/get-lesson-list-query.dto"

@Injectable()
export class LessonsService {
    private readonly logger = new Logger(LessonsService.name)

    constructor(
        @InjectRepository(LessonEntity)
        private lessonRepository: Repository<LessonEntity>,
    ) {}

    async existsById(id: number): Promise<boolean> {
        return this.lessonRepository.existsBy({ id })
    }


    async findAll(query: GetLessonListQueryDto) {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            search,
            sortDirection,
            categoryId,
            priceFrom,
            priceTo,
            scheduleStatus
        } = query

        const queryBuilder = this.lessonRepository.createQueryBuilder("lessons")

        queryBuilder.leftJoinAndSelect("lessons.pricingTiers", "pricingTiers", "pricingTiers.isActive = true")
        queryBuilder.leftJoinAndSelect("lessons.schedules", "schedules", "schedules.isCancelled = false")
        queryBuilder.leftJoinAndSelect("lessons.images", "images", "images.isCover = true")
        queryBuilder.leftJoinAndSelect("lessons.categories", "categories")

        queryBuilder.where("lessons.isActive = true")
        queryBuilder.andWhere("lessons.endsAt >= :now OR lessons.endsAt IS NULL", { now: new Date() })

        if (search) {
            queryBuilder.andWhere(
                "(lessons.name ILIKE :search OR lessons.description ILIKE :search)",
                { search: `%${search}%` },
            )
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
            queryBuilder.andWhere("schedules.date >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("schedules.date <= :dateTo", { dateTo })
        }

        if (scheduleStatus === "upcoming") {
            queryBuilder.andWhere(
                "lessons.startsAt > :now",
                { now: new Date() },
            )
        } else if (scheduleStatus === "ongoing") {
            queryBuilder.andWhere(
                "lessons.startsAt <= :now AND lessons.endsAt >= :now",
                { now: new Date() },
            )
        }

        queryBuilder.orderBy("lessons.startsAt", sortDirection)
        queryBuilder.skip((page - 1) * limit).take(limit)

        const [lessons, totalCount] = await queryBuilder.getManyAndCount()
        const totalPagesAmount = Math.ceil(totalCount / limit)

        this.logger.debug('Get lessons list: ', lessons)
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
                schedules: { isCancelled: false },
                pricingTiers: { isActive: true },
            },
            relations: {
                pricingTiers: true,
                schedules: true,
                images: true,
                categories: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                capacity: true,
                teacher: true,
                startsAt: true,
                endsAt: true,
                pricingTiers: {
                    id: true,
                    label: true,
                    price: true,
                    enrollmentType: true,
                },
                schedules: {
                    id: true,
                    date: true,
                    startTime: true,
                    durationMinutes: true,
                    address: true,
                    occupiedSpots: true,
                    capacity: true,
                },
                images: {
                    id: true,
                    url: true,
                    position: true,
                },
                categories: {
                    id: true,
                    name: true,
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
}