import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { ScheduleOverrideStatus } from "../enums/schedule-override-status.enum"
import { ScheduleOverrideRepository } from "../abstracts/schedule-override-repository.abstract"
import { ManageScheduleOverridesService } from "../services/manage-schedule-overrides.service"

const mockScheduleOverrideRepository = {
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}

describe("ManageScheduleOverridesService", () => {
    let service: ManageScheduleOverridesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageScheduleOverridesService,
                { provide: ScheduleOverrideRepository, useValue: mockScheduleOverrideRepository },
            ],
        }).compile()

        service = module.get(ManageScheduleOverridesService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return schedule override when it exists", async () => {
            const fakeOverride = { id: 1 } as LessonScheduleOverrideEntity
            mockScheduleOverrideRepository.findById.mockResolvedValue(fakeOverride)

            const result = await service.findById(1)

            expect(result).toEqual(fakeOverride)
            expect(mockScheduleOverrideRepository.findById).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when schedule override does not exist", async () => {
            mockScheduleOverrideRepository.findById.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        const data = { status: ScheduleOverrideStatus.CANCELLED }

        it("should update schedule override with given data", async () => {
            mockScheduleOverrideRepository.update.mockResolvedValue(true)

            await service.update(1, data)

            expect(mockScheduleOverrideRepository.update).toHaveBeenCalledWith(1, data)
        })

        it("should throw NotFoundException when schedule override does not exist", async () => {
            mockScheduleOverrideRepository.update.mockResolvedValue(false)

            await expect(service.update(99, data)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete schedule override", async () => {
            mockScheduleOverrideRepository.delete.mockResolvedValue(true)

            await service.delete(1)

            expect(mockScheduleOverrideRepository.delete).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when schedule override does not exist", async () => {
            mockScheduleOverrideRepository.delete.mockResolvedValue(false)

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})