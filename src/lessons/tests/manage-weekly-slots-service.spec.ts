import { NotFoundException, ConflictException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { DayOfWeek } from "../enums/day-of-week.enum"
import { WeeklySlotRepository } from "../abstracts/weekly-slot-repository.abstract"
import { ManageWeeklySlotsService } from "../services/manage-weekly-slots.service"

const mockWeeklySlotRepository = {
    findById: vi.fn(),
    findByIdWithLesson: vi.fn(),
    findDuplicates: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
}

// слот: понедельник 10:00, занятие с id = 10
const createFakeSlot = () => ({
    id: 1,
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: "10:00",
    durationMinutes: 45,
    lesson: { id: 10 },
}) as LessonWeeklySlotEntity

describe("ManageWeeklySlotsService", () => {
    let service: ManageWeeklySlotsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageWeeklySlotsService,
                { provide: WeeklySlotRepository, useValue: mockWeeklySlotRepository },
            ],
        }).compile()

        service = module.get(ManageWeeklySlotsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return weekly slot when it exists", async () => {
            const fakeSlot = createFakeSlot()
            mockWeeklySlotRepository.findById.mockResolvedValue(fakeSlot)

            const result = await service.findById(1)

            expect(result).toEqual(fakeSlot)
            expect(mockWeeklySlotRepository.findById).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when weekly slot does not exist", async () => {
            mockWeeklySlotRepository.findById.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should throw NotFoundException when weekly slot does not exist", async () => {
            mockWeeklySlotRepository.findByIdWithLesson.mockResolvedValue(null)

            await expect(service.update(99, { durationMinutes: 60 })).rejects.toThrow(NotFoundException)
            expect(mockWeeklySlotRepository.save).not.toHaveBeenCalled()
        })

        it("should save slot with new data", async () => {
            mockWeeklySlotRepository.findByIdWithLesson.mockResolvedValue(createFakeSlot())

            await service.update(1, { durationMinutes: 60 })

            expect(mockWeeklySlotRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ id: 1, durationMinutes: 60 })
            )
        })

        it("should not check duplicates when day and time are not changed", async () => {
            mockWeeklySlotRepository.findByIdWithLesson.mockResolvedValue(createFakeSlot())

            await service.update(1, { address: "New address" })

            expect(mockWeeklySlotRepository.findDuplicates).not.toHaveBeenCalled()
        })

        it("should check duplicates when start time is changed", async () => {
            mockWeeklySlotRepository.findByIdWithLesson.mockResolvedValue(createFakeSlot())
            mockWeeklySlotRepository.findDuplicates.mockResolvedValue([])

            await service.update(1, { startTime: "12:00" })

            // день остался прежним (понедельник), время новое
            expect(mockWeeklySlotRepository.findDuplicates).toHaveBeenCalledWith(
                10,
                [DayOfWeek.MONDAY],
                "12:00"
            )
        })

        it("should throw ConflictException when another slot has the same day and time", async () => {
            mockWeeklySlotRepository.findByIdWithLesson.mockResolvedValue(createFakeSlot())
            mockWeeklySlotRepository.findDuplicates.mockResolvedValue([{ id: 2 }])

            await expect(service.update(1, { dayOfWeek: DayOfWeek.TUESDAY })).rejects.toThrow(ConflictException)
            expect(mockWeeklySlotRepository.save).not.toHaveBeenCalled()
        })

        it("should not treat the slot itself as a duplicate", async () => {
            mockWeeklySlotRepository.findByIdWithLesson.mockResolvedValue(createFakeSlot())
            mockWeeklySlotRepository.findDuplicates.mockResolvedValue([{ id: 1 }]) // найден только сам слот

            await service.update(1, { startTime: "10:00" })

            expect(mockWeeklySlotRepository.save).toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete weekly slot", async () => {
            mockWeeklySlotRepository.delete.mockResolvedValue(true)

            await service.delete(1)

            expect(mockWeeklySlotRepository.delete).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when weekly slot does not exist", async () => {
            mockWeeklySlotRepository.delete.mockResolvedValue(false)

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})