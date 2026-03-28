export enum ApplicationStatus {
    APPROVED = "approved",
    REJECTED = "rejected",
    PENDING = "pending",
    CANCELLED = "cancelled",
    BLOCKED = "blocked",
}

export const REAPPLICABLE_STATUSES = [
    ApplicationStatus.REJECTED,
    ApplicationStatus.CANCELLED,
]

export const FINAL_STATUSES = [
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
]