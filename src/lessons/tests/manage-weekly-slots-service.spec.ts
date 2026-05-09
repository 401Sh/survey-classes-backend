import { NotFoundException, ConflictException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { ManageWeeklySlotsService } from "../services/manage-weekly-slots.service"

const mockWeeklySlotRepository = {
    findOne: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
}

describe("ManageWeeklySlotsService", () => {
    let service: ManageWeeklySlotsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageWeeklySlotsService,
                {
                    provide: getRepositoryToken(LessonWeeklySlotEntity),
                    useValue: mockWeeklySlotRepository,
                },
            ],
        }).compile()

        service = module.get<ManageWeeklySlotsService>(ManageWeeklySlotsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return weekly slot when it exists", async () => {
            const fakeSlot = { id: 1 } as unknown as LessonWeeklySlotEntity
            mockWeeklySlotRepository.findOne.mockResolvedValue(fakeSlot)

            const result = await service.findById(1)

            expect(result).toEqual(fakeSlot)
        })

        it("should throw NotFoundException when weekly slot does not exist", async () => {
            mockWeeklySlotRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should update slot without duplicate check when dayOfWeek and startTime not provided", async () => {
            const fakeSlot = {
                id: 1,
                dayOfWeek: 1,
                startTime: "10:00",
                lesson: { id: 10 },
            } as unknown as LessonWeeklySlotEntity

            mockWeeklySlotRepository.findOne.mockResolvedValue(fakeSlot)
            mockWeeklySlotRepository.save.mockResolvedValue(fakeSlot)

            await expect(service.update(1, { durationMinutes: 60 })).resolves.not.toThrow()

            expect(mockWeeklySlotRepository.findOne).toHaveBeenCalledTimes(1)
        })

        it("should update slot when no duplicate exists", async () => {
            const fakeSlot = {
                id: 1,
                dayOfWeek: 1,
                startTime: "10:00",
                lesson: { id: 10 },
            } as unknown as LessonWeeklySlotEntity

            mockWeeklySlotRepository.findOne
                .mockResolvedValueOnce(fakeSlot)
                .mockResolvedValueOnce(null)
            mockWeeklySlotRepository.save.mockResolvedValue(fakeSlot)

            await expect(service.update(1, { dayOfWeek: 2 })).resolves.not.toThrow()
        })

        it("should throw ConflictException when duplicate slot exists for same lesson", async () => {
            const fakeSlot = {
                id: 1,
                dayOfWeek: 1,
                startTime: "10:00",
                lesson: { id: 10 },
            } as unknown as LessonWeeklySlotEntity

            const duplicateSlot = {
                id: 2,
                dayOfWeek: 2,
                startTime: "10:00",
            } as unknown as LessonWeeklySlotEntity

            mockWeeklySlotRepository.findOne
                .mockResolvedValueOnce(fakeSlot)
                .mockResolvedValueOnce(duplicateSlot)

            await expect(service.update(1, { dayOfWeek: 2 })).rejects.toThrow(ConflictException)
        })

        it("should not throw ConflictException when duplicate is the same slot", async () => {
            const fakeSlot = {
                id: 1,
                dayOfWeek: 1,
                startTime: "10:00",
                lesson: { id: 10 },
            } as unknown as LessonWeeklySlotEntity

            mockWeeklySlotRepository.findOne
                .mockResolvedValueOnce(fakeSlot)
                .mockResolvedValueOnce(fakeSlot) // duplicate.id === slotId
            mockWeeklySlotRepository.save.mockResolvedValue(fakeSlot)

            await expect(service.update(1, { dayOfWeek: 1 })).resolves.not.toThrow()
        })

        it("should use existing slot values when only partial data provided", async () => {
            const fakeSlot = {
                id: 1,
                dayOfWeek: 3,
                startTime: "09:00",
                lesson: { id: 10 },
            } as unknown as LessonWeeklySlotEntity

            mockWeeklySlotRepository.findOne
                .mockResolvedValueOnce(fakeSlot)
                .mockResolvedValueOnce(null)
            mockWeeklySlotRepository.save.mockResolvedValue(fakeSlot)

            await service.update(1, { startTime: "11:00" })

            expect(mockWeeklySlotRepository.findOne).toHaveBeenNthCalledWith(2,
                expect.objectContaining({
                    where: expect.objectContaining({
                        dayOfWeek: 3,
                        startTime: "11:00",
                    }),
                })
            )
        })

        it("should throw NotFoundException when slot does not exist", async () => {
            mockWeeklySlotRepository.findOne.mockResolvedValue(null)

            await expect(service.update(99, { dayOfWeek: 1 })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete slot successfully", async () => {
            mockWeeklySlotRepository.delete.mockResolvedValue({ affected: 1 })

            await expect(service.delete(1)).resolves.not.toThrow()
        })

        it("should throw NotFoundException when slot does not exist", async () => {
            mockWeeklySlotRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})