import { Injectable } from "@nestjs/common"
import { LessonEntity } from "../entities/lesson.entity"
import {
    CreateLessonData,
    LessonListFilters,
    LessonRepository,
    ManageLessonListFilters,
} from "../abstracts/lesson-repository.abstract"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { CategoryEntity } from "src/dictionaries/entities/category.entity"
import { EnrollmentStatus } from "src/enrollments/enums/enrollment-status.enum"

@Injectable()
export class TypeOrmLessonRepository implements LessonRepository {
    constructor(
        @InjectRepository(LessonEntity)
        private readonly lessonRepository: Repository<LessonEntity>,
    ) {}

    async create(userId: number, data: CreateLessonData, categories: CategoryEntity[]): Promise<LessonEntity> {
        const lesson = await this.lessonRepository.save({
            ...data,
            createdBy: { id: userId },
            categories,
        })

        return lesson
    }


    async save(lesson: LessonEntity): Promise<LessonEntity> {
        const savedLesson = await this.lessonRepository.save(lesson)

        return savedLesson
    }


    async findByIdWithDetails(id: number): Promise<LessonEntity | null> {
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

        return lesson
    }


    async findByIdWithCategories(id: number): Promise<LessonEntity | null> {
        const lesson = await this.lessonRepository.findOne({
            where: { id },
            relations: { categories: true },
        })

        return lesson
    }


    async findActiveSimplifiedById(id: number): Promise<LessonEntity | null> {
        const lesson = await this.lessonRepository.findOne({
            where: {
                id,
                isActive: true,
            },
            select: {
                id: true,
                enrollmentMode: true,
            },
        })
 
        return lesson
    }


    async existsById(id: number): Promise<boolean> {
        const isLessonExists = await this.lessonRepository.exists({
            where: { id }
        })

        return isLessonExists
    }


    async existsWithActiveEnrollments(id: number): Promise<boolean> {
        const isLessonExists = await this.lessonRepository.exists({
            where: {
                id,
                enrollments: { status: EnrollmentStatus.ACTIVE },
            },
            relations: { enrollments: true },
        })

        return isLessonExists
    }


    async findPage(filters: ManageLessonListFilters): Promise<[LessonEntity[], number]> {
        const {
            limit,
            page,
            dateFrom,
            dateTo,
            isActive,
            search,
            minAge,
            sortDirection,
            categoryId,
            priceFrom,
            priceTo,
        } = filters

        const queryBuilder = this.lessonRepository.createQueryBuilder("lessons")

        queryBuilder.leftJoinAndSelect("lessons.pricingTiers", "pricingTiers")
        queryBuilder.leftJoinAndSelect("lessons.images", "images")
        queryBuilder.leftJoinAndSelect("lessons.categories", "categories")

        if (isActive !== undefined) {
            queryBuilder.where("lessons.isActive = :isActive", { isActive })
        }

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
            // TODO: add array query search
            queryBuilder
                .innerJoin("lessons.categories", "categoryFilter") 
                .andWhere("categoryFilter.id = :categoryId", { categoryId })
        }

        if (priceFrom || priceTo) {
            queryBuilder.innerJoin("lessons.pricingTiers", "priceFilter")

            if (priceFrom) {
                queryBuilder.andWhere("priceFilter.price >= :priceFrom", { priceFrom })
            }
            if (priceTo) {
                queryBuilder.andWhere("priceFilter.price <= :priceTo", { priceTo })
            }
        }

        if (dateFrom) {
            queryBuilder.andWhere("lessons.startsAt >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("lessons.endsAt <= :dateTo", { dateTo })
        }

        queryBuilder.orderBy("lessons.startsAt", sortDirection)
        queryBuilder.skip((page - 1) * limit).take(limit)

        return await queryBuilder.getManyAndCount()
    }


    async findActivePage(filters: LessonListFilters): Promise<[LessonEntity[], number]> {
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
        } = filters

        const queryBuilder = this.lessonRepository.createQueryBuilder("lessons")

        queryBuilder.leftJoinAndSelect("lessons.pricingTiers", "pricingTiers", "pricingTiers.isActive = true")
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

        return await queryBuilder.getManyAndCount()
    }


    async findActiveByIdWithDetails(id: number): Promise<LessonEntity | null> {
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

        return lesson
    }


    async softDelete(id: number): Promise<boolean> {
        const deleteResult = await this.lessonRepository.softDelete({ id })
 
        return (deleteResult.affected && deleteResult.affected > 0 ) ? true : false
    }
}