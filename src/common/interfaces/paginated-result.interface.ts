export interface PaginatedResult<T> {
    data: T[]
    meta: {
        totalCount: number
        totalPagesAmount: number
        currentPage: number
    }
}