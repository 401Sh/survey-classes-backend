import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { ManageScheduleOverridesService } from "../services/manage-schedule-overrides.service"

const mockScheduleOverrideRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}

describe("ManageScheduleOverridesService", () => {
    let service: ManageScheduleOverridesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageScheduleOverridesService,
                {
                    provide: getRepositoryToken(LessonScheduleOverrideEntity),
                    useValue: mockScheduleOverrideRepository,
                },
            ],
        }).compile()

        service = module.get<ManageScheduleOverridesService>(ManageScheduleOverridesService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe("findById", () => {
        it("should return schedule override when it exists", async () => {
            const fakeOverride = { id: 1 } as unknown as LessonScheduleOverrideEntity
            mockScheduleOverrideRepository.findOne.mockResolvedValue(fakeOverride)

            const result = await service.findById(1)

            expect(result).toEqual(fakeOverride)
        })

        it("should throw NotFoundException when schedule override does not exist", async () => {
            mockScheduleOverrideRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    describe("update", () => {
        it("should update schedule override successfully", async () => {
            mockScheduleOverrideRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.update(1, { date: new Date("2024-01-01") })).resolves.not.toThrow()
        })

        it("should throw NotFoundException when schedule override does not exist", async () => {
            mockScheduleOverrideRepository.update.mockResolvedValue({ affected: 0 })

            await expect(service.update(99, { date: new Date("2024-01-01") })).rejects.toThrow(NotFoundException)
        })
    })

    describe("delete", () => {
        it("should delete schedule override successfully", async () => {
            mockScheduleOverrideRepository.delete.mockResolvedValue({ affected: 1 })

            await expect(service.delete(1)).resolves.not.toThrow()
        })

        it("should throw NotFoundException when schedule override does not exist", async () => {
            mockScheduleOverrideRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})