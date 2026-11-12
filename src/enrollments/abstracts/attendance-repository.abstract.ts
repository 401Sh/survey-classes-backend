import { SortDirection } from "src/common/enums/sort-direction.enum"
import { AttendanceEntity } from "../entities/attendance.entity"

export type AttendanceListFilters = {
    page: number,
    limit: number,
    sortDirection: SortDirection,
    isPresent?: boolean,
    subscriptionId?: number,
    lessonId?: number,
    userId?: number,
    childId?: number,
    dateFrom?: Date,
    dateTo?: Date,
}

export type AttendanceData = {
    date: Date,
    isPresent: boolean,
    note?: string,
}

// new subscription sessions state, which must be saved together with the attendance change
export type SubscriptionSessions = {
    sessionsLeft: number,
    isActive: boolean,
}

export abstract class AttendanceRepository {
    abstract createWithSessions(
        subscriptionId: number,
        data: AttendanceData,
        sessions?: SubscriptionSessions,
    ): Promise<AttendanceEntity>
    abstract findByIdWithSubscription(id: number): Promise<AttendanceEntity | null>
    abstract findPage(filters: AttendanceListFilters): Promise<[AttendanceEntity[], number]>
    abstract updateWithSessions(
        id: number,
        data: Partial<AttendanceData>,
        subscriptionId: number,
        sessions?: SubscriptionSessions,
    ): Promise<boolean>
    abstract deleteWithSessions(
        id: number,
        subscriptionId: number,
        sessions?: SubscriptionSessions,
    ): Promise<boolean>
}