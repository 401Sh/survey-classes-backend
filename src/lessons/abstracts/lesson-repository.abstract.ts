import { SortDirection } from "src/common/enums/sort-direction.enum"
import { LessonEntity } from "../entities/lesson.entity"
import { EnrollmentMode } from "../enums/enrollment-mode.enum"
import { CategoryEntity } from "src/dictionaries/entities/category.entity"

export type LessonListFilters = {
    page: number,
    limit: number,
    sortDirection: SortDirection,
    search?: string,
    minAge?: number,
    categoryId?: number,
    priceFrom?: number,
    priceTo?: number,
    dateFrom?: Date,
    dateTo?: Date,
}

export type ManageLessonListFilters = LessonListFilters & {
    isActive?: boolean,
}

export type CreateLessonData = {
    name: string,
    isActive: boolean,
    minAge: number,
    description?: string,
    teacher?: string,
    startsAt?: Date,
    endsAt?: Date,
    enrollmentMode: EnrollmentMode,
}

export abstract class LessonRepository {
    // public
    abstract findActivePage(filters: LessonListFilters): Promise<[LessonEntity[], number]>
    abstract findActiveByIdWithDetails(id: number): Promise<LessonEntity | null>
    abstract findActiveSimplifiedById(id: number): Promise<LessonEntity | null>

    // manage
    abstract create(userId: number, data: CreateLessonData, categories: CategoryEntity[]): Promise<LessonEntity>
    abstract save(lesson: LessonEntity): Promise<LessonEntity>
    abstract findPage(filters: ManageLessonListFilters): Promise<[LessonEntity[], number]>
    abstract findByIdWithDetails(id: number): Promise<LessonEntity | null>
    abstract findByIdWithCategories(id: number): Promise<LessonEntity | null>
    abstract existsById(id: number): Promise<boolean>
    abstract existsWithActiveEnrollments(id: number): Promise<boolean>
    abstract softDelete(id: number): Promise<boolean>
}