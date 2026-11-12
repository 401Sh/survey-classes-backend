import { SortDirection } from "src/common/enums/sort-direction.enum"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"

export type EnrollmentListFilters = {
    page: number,
    limit: number,
    sortDirection: SortDirection,
    status?: EnrollmentStatus,
    lessonId?: number,
    childId?: number,
    dateFrom?: Date,
    dateTo?: Date,
}

export type ManageEnrollmentListFilters = EnrollmentListFilters & {
    parentId?: number,
}

export type CreateEnrollmentData = {
    userId: number,
    childId: number,
    lessonId: number,
    enrolledAt: Date,
    consentedAt: Date,
    isConsented: boolean,
    status: EnrollmentStatus,
}

export abstract class EnrollmentRepository {
    // public
    abstract create(data: CreateEnrollmentData): Promise<EnrollmentEntity>
    abstract findByIdAndUserIdWithDetails(id: number, userId: number): Promise<EnrollmentEntity | null>
    abstract findActiveByIdAndUserIdWithLesson(id: number, userId: number): Promise<EnrollmentEntity | null>
    abstract findPageByUserId(
        userId: number,
        filters: EnrollmentListFilters,
    ): Promise<[EnrollmentEntity[], number]>
    abstract existsNotSuspendedByLessonIdAndChildId(lessonId: number, childId: number): Promise<boolean>
    abstract deletePendingByIdAndUserId(id: number, userId: number): Promise<boolean>

    // manage
    abstract findById(id: number): Promise<EnrollmentEntity | null>
    abstract findByIdWithDetails(id: number): Promise<EnrollmentEntity | null>
    abstract findPage(filters: ManageEnrollmentListFilters): Promise<[EnrollmentEntity[], number]>
    abstract updateStatus(id: number, status: EnrollmentStatus): Promise<boolean>
}