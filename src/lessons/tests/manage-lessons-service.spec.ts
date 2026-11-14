import { NotFoundException, ConflictException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { CategoryEntity } from "src/dictionaries/entities/category.entity"
import { ManageDictionariesService } from "src/dictionaries/services/manage-dictionaries.service"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonEntity } from "../entities/lesson.entity"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { DayOfWeek } from "../enums/day-of-week.enum"
import { EnrollmentMode } from "../enums/enrollment-mode.enum"
import { ScheduleOverrideStatus } from "../enums/schedule-override-status.enum"
import { LessonRepository } from "../abstracts/lesson-repository.abstract"
import { PricingTierRepository } from "../abstracts/pricing-tier-repository.abstract"
import { ScheduleOverrideRepository } from "../abstracts/schedule-override-repository.abstract"
import { WeeklySlotRepository } from "../abstracts/weekly-slot-repository.abstract"
import {
    CreateLessonBodyDto,
    CreatePricingTierBodyDto,
    CreateScheduleOverrideBodyDto,
    CreateWeeklySlotBodyDto,
    GetManageLessonListQueryDto,
    GetManagePricingTierQueryDto,
    GetManageScheduleOverrideQueryDto,
    GetWeeklySlotQueryDto,
} from "../dto"
import { ManageLessonsService } from "../services/manage-lessons.service"

const mockLessonRepository = {
    create: vi.fn(),
    save: vi.fn(),
    findPage: vi.fn(),
    findByIdWithDetails: vi.fn(),
    findByIdWithCategories: vi.fn(),
    existsById: vi.fn(),
    existsWithActiveEnrollments: vi.fn(),
    softDelete: vi.fn(),
}

const mockPricingTierRepository = {
    create: vi.fn(),
    findAllByLessonId: vi.fn(),
}

const mockWeeklySlotRepository = {
    create: vi.fn(),
    createMany: vi.fn(),
    findDuplicates: vi.fn(),
    findAllByLessonId: vi.fn(),
}

const mockScheduleOverrideRepository = {
    create: vi.fn(),
    findAllByLessonId: vi.fn(),
}

const mockManageDictionariesService = {
    findCategoriesByIds: vi.fn(),
}

describe("ManageLessonsService", () => {
    let service: ManageLessonsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageLessonsService,
                { provide: LessonRepository, useValue: mockLessonRepository },
                { provide: PricingTierRepository, useValue: mockPricingTierRepository },
                { provide: WeeklySlotRepository, useValue: mockWeeklySlotRepository },
                { provide: ScheduleOverrideRepository, useValue: mockScheduleOverrideRepository },
                { provide: ManageDictionariesService, useValue: mockManageDictionariesService },
            ],
        }).compile()

        service = module.get(ManageLessonsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("create", () => {
        const baseData = {
            name: "Math",
            isActive: true,
            minAge: 7,
            enrollmentMode: EnrollmentMode.AUTO,
        }

        it("should create lesson without loading categories when categoryIds is empty", async () => {
            const fakeLesson = { id: 1 } as LessonEntity
            mockLessonRepository.create.mockResolvedValue(fakeLesson)

            const result = await service.create(5, { ...baseData, categoryIds: [] } as CreateLessonBodyDto)

            expect(result).toEqual(fakeLesson)
            expect(mockManageDictionariesService.findCategoriesByIds).not.toHaveBeenCalled()
            expect(mockLessonRepository.create).toHaveBeenCalledWith(5, baseData, [])
        })

        it("should load categories by ids and pass them to repository", async () => {
            const fakeCategories = [{ id: 1 }, { id: 2 }] as CategoryEntity[]
            mockManageDictionariesService.findCategoriesByIds.mockResolvedValue(fakeCategories)
            mockLessonRepository.create.mockResolvedValue({ id: 1 })

            await service.create(5, { ...baseData, categoryIds: [1, 2] } as CreateLessonBodyDto)

            expect(mockManageDictionariesService.findCategoriesByIds).toHaveBeenCalledWith([1, 2])
            // categoryIds не должны попасть в данные занятия
            expect(mockLessonRepository.create).toHaveBeenCalledWith(5, baseData, fakeCategories)
        })
    })

    // -------------------------------------------------------------------------

    describe("createPricingTier", () => {
        const data = { label: "Month", price: 1000, sessionsCount: 8, isActive: true } as CreatePricingTierBodyDto

        it("should create pricing tier for existing lesson", async () => {
            const fakeTier = { id: 1 } as LessonPricingTierEntity
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockPricingTierRepository.create.mockResolvedValue(fakeTier)

            const result = await service.createPricingTier(1, data)

            expect(result).toEqual(fakeTier)
            expect(mockPricingTierRepository.create).toHaveBeenCalledWith(1, data)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.existsById.mockResolvedValue(false)

            await expect(service.createPricingTier(99, data)).rejects.toThrow(NotFoundException)
            expect(mockPricingTierRepository.create).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("createWeeklySlots", () => {
        const data = {
            startTime: "10:00",
            durationMinutes: 45,
            address: "Main street 1",
            isActive: true,
            daysOfWeek: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
        } as CreateWeeklySlotBodyDto

        it("should create slots for all given days", async () => {
            const fakeSlots = [{ id: 1 }, { id: 2 }] as LessonWeeklySlotEntity[]
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockWeeklySlotRepository.findDuplicates.mockResolvedValue([])
            mockWeeklySlotRepository.createMany.mockResolvedValue(fakeSlots)

            const result = await service.createWeeklySlots(1, data)

            expect(result).toEqual(fakeSlots)
            expect(mockWeeklySlotRepository.findDuplicates).toHaveBeenCalledWith(
                1,
                [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
                "10:00"
            )
            // daysOfWeek передаются отдельно, а не внутри данных слота
            expect(mockWeeklySlotRepository.createMany).toHaveBeenCalledWith(
                1,
                { startTime: "10:00", durationMinutes: 45, address: "Main street 1", isActive: true },
                [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY]
            )
        })

        it("should throw ConflictException when slots already exist", async () => {
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockWeeklySlotRepository.findDuplicates.mockResolvedValue([{ id: 5, dayOfWeek: DayOfWeek.MONDAY }])

            await expect(service.createWeeklySlots(1, data)).rejects.toThrow(ConflictException)
            expect(mockWeeklySlotRepository.createMany).not.toHaveBeenCalled()
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.existsById.mockResolvedValue(false)

            await expect(service.createWeeklySlots(99, data)).rejects.toThrow(NotFoundException)
            expect(mockWeeklySlotRepository.createMany).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("createScheduleOverride", () => {
        const data = {
            date: new Date("2026-01-10"),
            status: ScheduleOverrideStatus.CANCELLED,
        } as CreateScheduleOverrideBodyDto

        it("should create schedule override for existing lesson", async () => {
            const fakeOverride = { id: 1 } as LessonScheduleOverrideEntity
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockScheduleOverrideRepository.create.mockResolvedValue(fakeOverride)

            const result = await service.createScheduleOverride(1, data)

            expect(result).toEqual(fakeOverride)
            expect(mockScheduleOverrideRepository.create).toHaveBeenCalledWith(1, data)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.existsById.mockResolvedValue(false)

            await expect(service.createScheduleOverride(99, data)).rejects.toThrow(NotFoundException)
            expect(mockScheduleOverrideRepository.create).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        const query = {
            page: 1,
            limit: 5,
            sortDirection: SortDirection.ASC,
        } as GetManageLessonListQueryDto

        it("should return lessons with pagination meta", async () => {
            const fakeLessons = [{ id: 1 }, { id: 2 }] as LessonEntity[]
            mockLessonRepository.findPage.mockResolvedValue([fakeLessons, 12])

            const result = await service.findAll(query)

            expect(mockLessonRepository.findPage).toHaveBeenCalledWith(query)
            expect(result).toEqual({
                data: fakeLessons,
                meta: {
                    totalCount: 12,
                    totalPagesAmount: 3, // 12 занятий по 5 на странице = 3 страницы
                    currentPage: 1,
                },
            })
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return lesson when it exists", async () => {
            const fakeLesson = { id: 1 } as LessonEntity
            mockLessonRepository.findByIdWithDetails.mockResolvedValue(fakeLesson)

            const result = await service.findById(1)

            expect(result).toEqual(fakeLesson)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.findByIdWithDetails.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAllPricingTiersByLessonId", () => {
        it("should return pricing tiers filtered by isActive", async () => {
            const fakeTiers = [{ id: 1 }] as LessonPricingTierEntity[]
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockPricingTierRepository.findAllByLessonId.mockResolvedValue(fakeTiers)

            const result = await service.findAllPricingTiersByLessonId(
                1,
                { isActive: true } as GetManagePricingTierQueryDto
            )

            expect(result).toEqual(fakeTiers)
            expect(mockPricingTierRepository.findAllByLessonId).toHaveBeenCalledWith(1, true)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.existsById.mockResolvedValue(false)

            await expect(
                service.findAllPricingTiersByLessonId(99, {} as GetManagePricingTierQueryDto)
            ).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAllWeeklySlotsByLessonId", () => {
        it("should return weekly slots filtered by query", async () => {
            const query = { isActive: true, daysOfWeek: [DayOfWeek.MONDAY] } as GetWeeklySlotQueryDto
            const fakeSlots = [{ id: 1 }] as LessonWeeklySlotEntity[]
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockWeeklySlotRepository.findAllByLessonId.mockResolvedValue(fakeSlots)

            const result = await service.findAllWeeklySlotsByLessonId(1, query)

            expect(result).toEqual(fakeSlots)
            expect(mockWeeklySlotRepository.findAllByLessonId).toHaveBeenCalledWith(1, query)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.existsById.mockResolvedValue(false)

            await expect(
                service.findAllWeeklySlotsByLessonId(99, {} as GetWeeklySlotQueryDto)
            ).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAllScheduleOverridesByLessonId", () => {
        it("should return schedule overrides filtered by query", async () => {
            const query = { status: ScheduleOverrideStatus.MOVED } as GetManageScheduleOverrideQueryDto
            const fakeOverrides = [{ id: 1 }] as LessonScheduleOverrideEntity[]
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockScheduleOverrideRepository.findAllByLessonId.mockResolvedValue(fakeOverrides)

            const result = await service.findAllScheduleOverridesByLessonId(1, query)

            expect(result).toEqual(fakeOverrides)
            expect(mockScheduleOverrideRepository.findAllByLessonId).toHaveBeenCalledWith(1, query)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.existsById.mockResolvedValue(false)

            await expect(
                service.findAllScheduleOverridesByLessonId(99, {} as GetManageScheduleOverrideQueryDto)
            ).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.findByIdWithCategories.mockResolvedValue(null)

            await expect(service.update(99, { name: "New" })).rejects.toThrow(NotFoundException)
            expect(mockLessonRepository.save).not.toHaveBeenCalled()
        })

        it("should update lesson fields and save", async () => {
            const fakeLesson = { id: 1, name: "Old", categories: [] } as unknown as LessonEntity
            mockLessonRepository.findByIdWithCategories.mockResolvedValue(fakeLesson)

            await service.update(1, { name: "New" })

            expect(mockLessonRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ id: 1, name: "New" })
            )
        })

        it("should not touch categories when categoryIds is not provided", async () => {
            const oldCategories = [{ id: 1 }] as CategoryEntity[]
            const fakeLesson = { id: 1, categories: oldCategories } as LessonEntity
            mockLessonRepository.findByIdWithCategories.mockResolvedValue(fakeLesson)

            await service.update(1, { name: "New" })

            expect(mockManageDictionariesService.findCategoriesByIds).not.toHaveBeenCalled()
            expect(fakeLesson.categories).toEqual(oldCategories)
        })

        it("should replace categories when categoryIds is provided", async () => {
            const newCategories = [{ id: 2 }, { id: 3 }] as CategoryEntity[]
            const fakeLesson = { id: 1, categories: [{ id: 1 }] } as LessonEntity
            mockLessonRepository.findByIdWithCategories.mockResolvedValue(fakeLesson)
            mockManageDictionariesService.findCategoriesByIds.mockResolvedValue(newCategories)

            await service.update(1, { categoryIds: [2, 3] })

            expect(mockManageDictionariesService.findCategoriesByIds).toHaveBeenCalledWith([2, 3])
            expect(mockLessonRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ categories: newCategories })
            )
        })

        it("should remove all categories when categoryIds is empty", async () => {
            const fakeLesson = { id: 1, categories: [{ id: 1 }] } as LessonEntity
            mockLessonRepository.findByIdWithCategories.mockResolvedValue(fakeLesson)

            await service.update(1, { categoryIds: [] })

            expect(mockManageDictionariesService.findCategoriesByIds).not.toHaveBeenCalled()
            expect(mockLessonRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ categories: [] })
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete lesson without active enrollments", async () => {
            mockLessonRepository.existsWithActiveEnrollments.mockResolvedValue(false)
            mockLessonRepository.softDelete.mockResolvedValue(true)

            await service.delete(1)

            expect(mockLessonRepository.softDelete).toHaveBeenCalledWith(1)
        })

        it("should throw ConflictException when lesson has active enrollments", async () => {
            mockLessonRepository.existsWithActiveEnrollments.mockResolvedValue(true)

            await expect(service.delete(1)).rejects.toThrow(ConflictException)
            expect(mockLessonRepository.softDelete).not.toHaveBeenCalled()
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.existsWithActiveEnrollments.mockResolvedValue(false)
            mockLessonRepository.softDelete.mockResolvedValue(false)

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})