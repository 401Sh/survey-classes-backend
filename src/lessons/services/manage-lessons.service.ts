import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { LessonEntity } from "../entities/lesson.entity"
import { Repository } from "typeorm"
import { GetLessonListQueryDto } from "../dto/get-lesson-list-query.dto"
import { CreateLessonBodyDto } from "../dto/create-lesson-body.dto"
import { UpdateLessonBodyDto } from "../dto/update-lesson-body.dto"
import { CategoryEntity } from "src/dictionaries/entities/category.entity"
import { ManageDictionariesService } from "src/dictionaries/services/manage-dictionaries.service"

@Injectable()
export class ManageLessonsService {
    private readonly logger = new Logger(ManageLessonsService.name)

    constructor(
        @InjectRepository(LessonEntity)
        private lessonRepository: Repository<LessonEntity>,

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


    async findAll(query: GetLessonListQueryDto) {
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
            scheduleStatus
        } = query

        const queryBuilder = this.lessonRepository.createQueryBuilder("lessons")

        queryBuilder.leftJoinAndSelect("lessons.pricingTiers", "pricingTiers")
        queryBuilder.leftJoinAndSelect("lessons.schedules", "schedules")
        queryBuilder.leftJoinAndSelect("lessons.images", "images")
        queryBuilder.leftJoinAndSelect("lessons.categories", "categories")

        queryBuilder.where("lessons.isActive = :isActive", { isActive })

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


    async findById(id: number) {
        const lesson = await this.lessonRepository.findOne({
            where: { id },
            relations: {
                images: true,
                categories: true,
            },
        })
        
        if (!lesson) {
            this.logger.log(`No lesson with id: ${id}`)
            throw new NotFoundException(`Lesson with id ${id} not found`)
        }
    
        this.logger.log(`Finded lesson with id: ${id}`)
        this.logger.debug('Get lesson: ', lesson)
        return lesson
    }


    async existsById(id: number): Promise<boolean> {
        return this.lessonRepository.existsBy({ id })
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