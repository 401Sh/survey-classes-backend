import { NotFoundException, ConflictException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { CategoryEntity } from "src/dictionaries/entities/category.entity"
import { ManageDictionariesService } from "src/dictionaries/services/manage-dictionaries.service"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { LessonEntity } from "../entities/lesson.entity"
import { ManageLessonsService } from "../services/manage-lessons.service"
import { EnrollmentMode } from "../enums/enrollment-mode.enum"
import { ScheduleOverrideStatus } from "../enums/schedule-override-status.enum"
import { SortDirection } from "src/common/enums/sort-direction.enum"

const createQueryBuilderMock = () => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
})

const mockLessonRepository = {
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    exists: vi.fn(),
    delete: vi.fn(),
    createQueryBuilder: vi.fn(),
}

const mockPricingTierRepository = {
    save: vi.fn(),
    find: vi.fn(),
}

const mockWeeklySlotRepository = {
    save: vi.fn(),
    find: vi.fn(),
}

const mockScheduleOverrideRepository = {
    save: vi.fn(),
    find: vi.fn(),
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
                {
                    provide: ManageDictionariesService,
                    useValue: mockManageDictionariesService,
                },
            ],
        }).compile()

        service = module.get<ManageLessonsService>(ManageLessonsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("create", () => {
        it("should create lesson without categories", async () => {
            const fakeLesson = { id: 1, name: "Lesson" } as unknown as LessonEntity
            mockLessonRepository.save.mockResolvedValue(fakeLesson)

            const result = await service.create(1, {
                name: "Lesson",
                isActive: false,
                enrollmentMode: EnrollmentMode.AUTO,
                categoryIds: [],
                minAge: 0,
            })

            expect(result).toEqual(fakeLesson)
            expect(mockManageDictionariesService.findCategoriesByIds).not.toHaveBeenCalled()
        })

        it("should create lesson with categories when categoryIds provided", async () => {
            const fakeLesson = { id: 1 } as unknown as LessonEntity
            const fakeCategories = [{ id: 1 }, { id: 2 }] as unknown as CategoryEntity[]

            mockManageDictionariesService.findCategoriesByIds.mockResolvedValue(fakeCategories)
            mockLessonRepository.save.mockResolvedValue(fakeLesson)

            await service.create(1, {
                name: "Lesson",
                isActive: false,
                enrollmentMode: EnrollmentMode.AUTO,
                categoryIds: [1, 2],
                minAge: 0,
            })

            expect(mockManageDictionariesService.findCategoriesByIds).toHaveBeenCalledWith([1, 2])
            expect(mockLessonRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ categories: fakeCategories })
            )
        })

        it("should create lesson with empty categories when categoryIds is empty array", async () => {
            const fakeLesson = { id: 1 } as unknown as LessonEntity
            mockLessonRepository.save.mockResolvedValue(fakeLesson)

            await service.create(1, {
                name: "Lesson",
                isActive: false,
                enrollmentMode: EnrollmentMode.AUTO,
                categoryIds: [],
                minAge: 0,
            })

            expect(mockManageDictionariesService.findCategoriesByIds).not.toHaveBeenCalled()
            expect(mockLessonRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ categories: [] })
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("createPricingTier", () => {
        it("should create pricing tier for existing lesson", async () => {
            const fakeTier = { id: 1 } as unknown as LessonPricingTierEntity
            mockLessonRepository.exists.mockResolvedValue(true)
            mockPricingTierRepository.save.mockResolvedValue(fakeTier)

            const result = await service.createPricingTier(1, {
                label: "Basic",
                price: 1000,
                sessionsCount: 8,
                isActive: false,
            })

            expect(result).toEqual(fakeTier)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.exists.mockResolvedValue(false)

            await expect(service.createPricingTier(99, {
                label: "Basic",
                price: 1000,
                sessionsCount: 8,
                isActive: false,
            }))
            .rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("createWeeklySlots", () => {
        it("should create weekly slots for multiple days", async () => {
            const fakeSlots = [{ id: 1 }, { id: 2 }] as unknown as LessonWeeklySlotEntity[]
            mockLessonRepository.exists.mockResolvedValue(true)
            mockWeeklySlotRepository.find.mockResolvedValue([]) // дубликатов нет
            mockWeeklySlotRepository.save.mockResolvedValue(fakeSlots)

            const result = await service.createWeeklySlots(1, {
                daysOfWeek: [1, 2],
                startTime: "10:00",
                durationMinutes: 0,
                address: "",
                isActive: false
            })

            expect(result).toEqual(fakeSlots)
        })

        it("should throw ConflictException when duplicate slots exist", async () => {
            const existingSlot = { id: 1, dayOfWeek: 1 } as unknown as LessonWeeklySlotEntity
            mockLessonRepository.exists.mockResolvedValue(true)
            mockWeeklySlotRepository.find.mockResolvedValue([existingSlot])

            await expect(service.createWeeklySlots(1, {
                daysOfWeek: [1, 2],
                startTime: "10:00",
                durationMinutes: 0,
                address: "",
                isActive: false,
            }))
            .rejects.toThrow(ConflictException)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.exists.mockResolvedValue(false)

            await expect(service.createWeeklySlots(99, {
                daysOfWeek: [1], startTime: "10:00",
                durationMinutes: 0,
                address: "",
                isActive: false,
            }))
            .rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("createScheduleOverride", () => {
        it("should create schedule override for existing lesson", async () => {
            const fakeOverride = { id: 1 } as unknown as LessonScheduleOverrideEntity
            mockLessonRepository.exists.mockResolvedValue(true)
            mockScheduleOverrideRepository.save.mockResolvedValue(fakeOverride)

            const result = await service.createScheduleOverride(1, {
                date: new Date("2024-01-01"),
                status: ScheduleOverrideStatus.CANCELLED,
            })

            expect(result).toEqual(fakeOverride)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.exists.mockResolvedValue(false)

            await expect(service.createScheduleOverride(99, {
                date: new Date("2024-01-01"),
                status: ScheduleOverrideStatus.CANCELLED,
            }))
            .rejects.toThrow(NotFoundException)
        })
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

        it("should apply isActive filter when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockLessonRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, isActive: true })

            expect(qb.where).toHaveBeenCalledWith(
                "lessons.isActive = :isActive",
                { isActive: true }
            )
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

        it("should apply dateFrom and dateTo filters when provided", async () => {
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
        it("should return lesson when it exists", async () => {
            const fakeLesson = { id: 1 } as unknown as LessonEntity
            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)

            const result = await service.findById(1)

            expect(result).toEqual(fakeLesson)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAllPricingTiersByLessonId", () => {
        it("should return pricing tiers for existing lesson", async () => {
            const fakeTiers = [{ id: 1 }, { id: 2 }] as unknown as LessonPricingTierEntity[]
            mockLessonRepository.exists.mockResolvedValue(true)
            mockPricingTierRepository.find.mockResolvedValue(fakeTiers)

            const result = await service.findAllPricingTiersByLessonId(1, {})

            expect(result).toEqual(fakeTiers)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.exists.mockResolvedValue(false)

            await expect(service.findAllPricingTiersByLessonId(99, {}))
                .rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAllWeeklySlotsByLessonId", () => {
        it("should return weekly slots for existing lesson", async () => {
            const fakeSlots = [{ id: 1 }] as unknown as LessonWeeklySlotEntity[]
            mockLessonRepository.exists.mockResolvedValue(true)
            mockWeeklySlotRepository.find.mockResolvedValue(fakeSlots)

            const result = await service.findAllWeeklySlotsByLessonId(1, {})

            expect(result).toEqual(fakeSlots)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.exists.mockResolvedValue(false)

            await expect(service.findAllWeeklySlotsByLessonId(99, {}))
                .rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAllScheduleOverridesByLessonId", () => {
        it("should return schedule overrides for existing lesson", async () => {
            const fakeOverrides = [{ id: 1 }] as unknown as LessonScheduleOverrideEntity[]
            mockLessonRepository.exists.mockResolvedValue(true)
            mockScheduleOverrideRepository.find.mockResolvedValue(fakeOverrides)

            const result = await service.findAllScheduleOverridesByLessonId(1, {
                dateFrom: new Date("2023-12-31")
            })

            expect(result).toEqual(fakeOverrides)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.exists.mockResolvedValue(false)

            await expect(service.findAllScheduleOverridesByLessonId(99, {
                dateFrom: new Date("2023-12-31")
            }))
            .rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should update lesson without changing categories", async () => {
            const fakeLesson = {
                id: 1,
                name: "Old name",
                categories: [],
            } as unknown as LessonEntity

            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)
            mockLessonRepository.save.mockResolvedValue(fakeLesson)

            await expect(service.update(1, { name: "New name" })).resolves.not.toThrow()

            expect(mockManageDictionariesService.findCategoriesByIds).not.toHaveBeenCalled()
        })

        it("should update lesson categories when categoryIds provided", async () => {
            const fakeLesson = {
                id: 1,
                categories: [{ id: 1 }],
            } as unknown as LessonEntity
            const newCategories = [{ id: 2 }, { id: 3 }] as unknown as CategoryEntity[]

            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)
            mockManageDictionariesService.findCategoriesByIds.mockResolvedValue(newCategories)
            mockLessonRepository.save.mockResolvedValue(fakeLesson)

            await service.update(1, { categoryIds: [2, 3] })

            expect(mockManageDictionariesService.findCategoriesByIds).toHaveBeenCalledWith([2, 3])
        })

        it("should clear categories when categoryIds is empty array", async () => {
            const fakeLesson = {
                id: 1,
                categories: [{ id: 1 }],
            } as unknown as LessonEntity

            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)
            mockLessonRepository.save.mockResolvedValue(fakeLesson)

            await service.update(1, { categoryIds: [] })

            expect(mockManageDictionariesService.findCategoriesByIds).not.toHaveBeenCalled()
            expect(fakeLesson.categories).toEqual([])
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.findOne.mockResolvedValue(null)

            await expect(service.update(99, { name: "X" })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete lesson successfully", async () => {
            mockLessonRepository.delete.mockResolvedValue({ affected: 1 })

            await expect(service.delete(1)).resolves.not.toThrow()
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})