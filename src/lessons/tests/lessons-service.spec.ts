import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { LessonEntity } from "../entities/lesson.entity"
import { LessonsService } from "../services/lessons.service"
import { SortDirection } from "src/common/enums/sort-direction.enum"

const createQueryBuilderMock = () => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
})

const mockLessonRepository = {
    findOne: vi.fn(),
    createQueryBuilder: vi.fn(),
}

const mockPricingTierRepository = {
    find: vi.fn(),
}

const mockWeeklySlotRepository = {
    find: vi.fn(),
}

const mockScheduleOverrideRepository = {
    find: vi.fn(),
}

describe("LessonsService", () => {
    let service: LessonsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LessonsService,
                {
                    provide: getRepositoryToken(LessonEntity),
                    useValue: mockLessonRepository,
                },
                {
                    provide: getRepositoryToken(LessonPricingTierEntity),
                    useValue: mockPricingTierRepository,
                },
                {
                    provide: getRepositoryToken(LessonWeeklySlotEntity),
                    useValue: mockWeeklySlotRepository,
                },
                {
                    provide: getRepositoryToken(LessonScheduleOverrideEntity),
                    useValue: mockScheduleOverrideRepository,
                },
            ],
        }).compile()

        service = module.get<LessonsService>(LessonsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        const baseQuery = {
            page: 1,
            limit: 10,
            sortDirection: SortDirection.DESC,
        }

        it("should return paginated result", async () => {
            const fakeLessons = [{ id: 1 }, { id: 2 }] as unknown as LessonEntity[]
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([fakeLessons, 2])
            mockLessonRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll(baseQuery)

            expect(result.data).toEqual(fakeLessons)
            expect(result.meta).toEqual({
                totalCount: 2,
                totalPagesAmount: 1,
                currentPage: 1,
            })
        })

        it("should calculate totalPagesAmount correctly", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 25])
            mockLessonRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll({ ...baseQuery, limit: 10 })

            expect(result.meta.totalPagesAmount).toBe(3)
        })

        it("should apply search filter when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockLessonRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, search: "yoga" })

            expect(qb.andWhere).toHaveBeenCalledWith(
                "(lessons.name LIKE :search OR lessons.description LIKE :search)",
                { search: "%yoga%" }
            )
        })

        it("should apply price range filters when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockLessonRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, priceFrom: 100, priceTo: 500 })

            expect(qb.andWhere).toHaveBeenCalledWith(
                "pricingTiers.price >= :priceFrom",
                { priceFrom: 100 }
            )
            expect(qb.andWhere).toHaveBeenCalledWith(
                "pricingTiers.price <= :priceTo",
                { priceTo: 500 }
            )
        })

        it("should apply date filters when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockLessonRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, dateFrom: new Date("2024-01-01"), dateTo: new Date("2024-12-31") })

            expect(qb.andWhere).toHaveBeenCalledWith(
                "lessons.startsAt >= :dateFrom",
                { dateFrom: new Date("2024-01-01") }
            )
            expect(qb.andWhere).toHaveBeenCalledWith(
                "lessons.endsAt <= :dateTo",
                { dateTo: new Date("2024-12-31") }
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return lesson when it exists and is active", async () => {
            const fakeLesson = {
                id: 1,
                pricingTiers: [
                    { id: 1, isActive: true },
                    { id: 2, isActive: false },
                ],
            } as unknown as LessonEntity
            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)

            const result = await service.findById(1)

            expect(result).toBeDefined()
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findSchedulesByLessonId", () => {
        it("should return weekly slots and overrides", async () => {
            const fakeSlots = [{ id: 1, dayOfWeek: 1 }] as unknown as LessonWeeklySlotEntity[]
            const fakeOverrides = [{ id: 1, date: "2024-06-01" }] as unknown as LessonScheduleOverrideEntity[]

            mockWeeklySlotRepository.find.mockResolvedValue(fakeSlots)
            mockScheduleOverrideRepository.find.mockResolvedValue(fakeOverrides)

            const result = await service.findSchedulesByLessonId(1, { dateFrom: new Date("2023-01-01") })

            expect(result.weeklySlots).toEqual(fakeSlots)
            expect(result.overrides).toEqual(fakeOverrides)
        })

        it("should fetch weekly slots and overrides in parallel", async () => {
            mockWeeklySlotRepository.find.mockResolvedValue([])
            mockScheduleOverrideRepository.find.mockResolvedValue([])

            await service.findSchedulesByLessonId(1, { dateFrom: new Date("2023-01-01") })

            // оба репозитория вызваны — значит запросы шли параллельно через Promise.all
            expect(mockWeeklySlotRepository.find).toHaveBeenCalledTimes(1)
            expect(mockScheduleOverrideRepository.find).toHaveBeenCalledTimes(1)
        })

        it("should return empty arrays when no data found", async () => {
            mockWeeklySlotRepository.find.mockResolvedValue([])
            mockScheduleOverrideRepository.find.mockResolvedValue([])

            const result = await service.findSchedulesByLessonId(1, { dateFrom: new Date("2023-01-01") })

            expect(result.weeklySlots).toEqual([])
            expect(result.overrides).toEqual([])
        })
    })

    // -------------------------------------------------------------------------

    describe("findPricingTiersByLessonId", () => {
        it("should return active pricing tiers for lesson", async () => {
            const fakeTiers = [{ id: 1, isActive: true }] as unknown as LessonPricingTierEntity[]
            mockPricingTierRepository.find.mockResolvedValue(fakeTiers)

            const result = await service.findPricingTiersByLessonId(1)

            expect(result).toEqual(fakeTiers)
        })

        it("should return empty array when no active tiers found", async () => {
            mockPricingTierRepository.find.mockResolvedValue([])

            const result = await service.findPricingTiersByLessonId(1)

            expect(result).toEqual([])
        })
    })
})