import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonEntity } from "../entities/lesson.entity"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { LessonRepository } from "../abstracts/lesson-repository.abstract"
import { PricingTierRepository } from "../abstracts/pricing-tier-repository.abstract"
import { ScheduleOverrideRepository } from "../abstracts/schedule-override-repository.abstract"
import { WeeklySlotRepository } from "../abstracts/weekly-slot-repository.abstract"
import { GetLessonListQueryDto, GetScheduleOverrideQueryDto } from "../dto"
import { LessonsService } from "../services/lessons.service"

const mockLessonRepository = {
    findActivePage: vi.fn(),
    findActiveByIdWithDetails: vi.fn(),
}

const mockWeeklySlotRepository = {
    findActiveByLessonId: vi.fn(),
}

const mockScheduleOverrideRepository = {
    findPublicByLessonId: vi.fn(),
}

const mockPricingTierRepository = {
    findActiveByLessonId: vi.fn(),
}

describe("LessonsService", () => {
    let service: LessonsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LessonsService,
                { provide: LessonRepository, useValue: mockLessonRepository },
                { provide: WeeklySlotRepository, useValue: mockWeeklySlotRepository },
                { provide: ScheduleOverrideRepository, useValue: mockScheduleOverrideRepository },
                { provide: PricingTierRepository, useValue: mockPricingTierRepository },
            ],
        }).compile()

        service = module.get(LessonsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        const query = {
            page: 2,
            limit: 10,
            sortDirection: SortDirection.ASC,
        } as GetLessonListQueryDto

        it("should return lessons with pagination meta", async () => {
            const fakeLessons = [{ id: 1 }, { id: 2 }] as LessonEntity[]
            mockLessonRepository.findActivePage.mockResolvedValue([fakeLessons, 25])

            const result = await service.findAll(query)

            expect(result).toEqual({
                data: fakeLessons,
                meta: {
                    totalCount: 25,
                    totalPagesAmount: 3, // 25 занятий по 10 на странице = 3 страницы
                    currentPage: 2,
                },
            })
        })

        it("should pass query to repository", async () => {
            mockLessonRepository.findActivePage.mockResolvedValue([[], 0])

            await service.findAll(query)

            expect(mockLessonRepository.findActivePage).toHaveBeenCalledWith(query)
        })

        it("should return 0 pages when there are no lessons", async () => {
            mockLessonRepository.findActivePage.mockResolvedValue([[], 0])

            const result = await service.findAll(query)

            expect(result.data).toEqual([])
            expect(result.meta.totalPagesAmount).toBe(0)
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return lesson when it exists", async () => {
            const fakeLesson = { id: 1 } as LessonEntity
            mockLessonRepository.findActiveByIdWithDetails.mockResolvedValue(fakeLesson)

            const result = await service.findById(1)

            expect(result).toEqual(fakeLesson)
            expect(mockLessonRepository.findActiveByIdWithDetails).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.findActiveByIdWithDetails.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findSchedulesByLessonId", () => {
        it("should return weekly slots and overrides together", async () => {
            const fakeSlots = [{ id: 1 }] as LessonWeeklySlotEntity[]
            const fakeOverrides = [{ id: 2 }] as LessonScheduleOverrideEntity[]
            mockWeeklySlotRepository.findActiveByLessonId.mockResolvedValue(fakeSlots)
            mockScheduleOverrideRepository.findPublicByLessonId.mockResolvedValue(fakeOverrides)

            const result = await service.findSchedulesByLessonId(1, {} as GetScheduleOverrideQueryDto)

            expect(result).toEqual({ weeklySlots: fakeSlots, overrides: fakeOverrides })
        })

        it("should pass lesson id and dates to repositories", async () => {
            const dateFrom = new Date("2026-01-01")
            const dateTo = new Date("2026-01-31")
            mockWeeklySlotRepository.findActiveByLessonId.mockResolvedValue([])
            mockScheduleOverrideRepository.findPublicByLessonId.mockResolvedValue([])

            await service.findSchedulesByLessonId(5, { dateFrom, dateTo })

            expect(mockWeeklySlotRepository.findActiveByLessonId).toHaveBeenCalledWith(5)
            expect(mockScheduleOverrideRepository.findPublicByLessonId).toHaveBeenCalledWith(5, dateFrom, dateTo)
        })
    })

    // -------------------------------------------------------------------------

    describe("findPricingTiersByLessonId", () => {
        it("should return active pricing tiers of the lesson", async () => {
            const fakeTiers = [{ id: 1 }, { id: 2 }] as LessonPricingTierEntity[]
            mockPricingTierRepository.findActiveByLessonId.mockResolvedValue(fakeTiers)

            const result = await service.findPricingTiersByLessonId(1)

            expect(result).toEqual(fakeTiers)
            expect(mockPricingTierRepository.findActiveByLessonId).toHaveBeenCalledWith(1)
        })
    })
})