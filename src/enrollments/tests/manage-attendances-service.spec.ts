import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { AttendanceEntity } from "../entities/attendance.entity"
import { AttendanceRepository } from "../abstracts/attendance-repository.abstract"
import { GetAttendanceListQueryDto } from "../dto"
import { ManageAttendancesService } from "../services/manage-attendances.service"

const mockAttendanceRepository = {
    findByIdWithSubscription: vi.fn(),
    findPage: vi.fn(),
    updateWithSessions: vi.fn(),
    deleteWithSessions: vi.fn(),
}

// посещение с подпиской (id = 10, осталось 5 занятий)
const createFakeAttendance = (isPresent: boolean, sessionsLeft = 5) => ({
    id: 1,
    isPresent,
    subscription: { id: 10, sessionsLeft },
}) as AttendanceEntity

describe("ManageAttendancesService", () => {
    let service: ManageAttendancesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageAttendancesService,
                { provide: AttendanceRepository, useValue: mockAttendanceRepository },
            ],
        }).compile()

        service = module.get(ManageAttendancesService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        it("should return attendances with pagination meta", async () => {
            const query = { page: 3, limit: 10, sortDirection: SortDirection.ASC } as GetAttendanceListQueryDto
            const fakeAttendances = [{ id: 1 }] as AttendanceEntity[]
            mockAttendanceRepository.findPage.mockResolvedValue([fakeAttendances, 25])

            const result = await service.findAll(query)

            expect(mockAttendanceRepository.findPage).toHaveBeenCalledWith(query)
            expect(result).toEqual({
                data: fakeAttendances,
                meta: { totalCount: 25, totalPagesAmount: 3, currentPage: 3 },
            })
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should spend one session when absent child becomes present", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(createFakeAttendance(false, 5))
            mockAttendanceRepository.updateWithSessions.mockResolvedValue(true)

            await service.update(1, { isPresent: true })

            expect(mockAttendanceRepository.updateWithSessions).toHaveBeenCalledWith(
                1,
                { isPresent: true },
                10,
                { sessionsLeft: 4, isActive: true }
            )
        })

        it("should return one session when present child becomes absent", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(createFakeAttendance(true, 5))
            mockAttendanceRepository.updateWithSessions.mockResolvedValue(true)

            await service.update(1, { isPresent: false })

            expect(mockAttendanceRepository.updateWithSessions).toHaveBeenCalledWith(
                1,
                { isPresent: false },
                10,
                { sessionsLeft: 6, isActive: true }
            )
        })

        it("should deactivate subscription when the last session is spent", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(createFakeAttendance(false, 1))
            mockAttendanceRepository.updateWithSessions.mockResolvedValue(true)

            await service.update(1, { isPresent: true })

            expect(mockAttendanceRepository.updateWithSessions).toHaveBeenCalledWith(
                1,
                { isPresent: true },
                10,
                { sessionsLeft: 0, isActive: false }
            )
        })

        it("should reactivate subscription when a session is returned", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(createFakeAttendance(true, 0))
            mockAttendanceRepository.updateWithSessions.mockResolvedValue(true)

            await service.update(1, { isPresent: false })

            expect(mockAttendanceRepository.updateWithSessions).toHaveBeenCalledWith(
                1,
                { isPresent: false },
                10,
                { sessionsLeft: 1, isActive: true }
            )
        })

        it("should not change sessions when isPresent is the same", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(createFakeAttendance(true))
            mockAttendanceRepository.updateWithSessions.mockResolvedValue(true)

            await service.update(1, { isPresent: true })

            expect(mockAttendanceRepository.updateWithSessions).toHaveBeenCalledWith(
                1,
                { isPresent: true },
                10,
                undefined
            )
        })

        it("should not change sessions when isPresent is not provided", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(createFakeAttendance(true))
            mockAttendanceRepository.updateWithSessions.mockResolvedValue(true)

            await service.update(1, { note: "Late" })

            expect(mockAttendanceRepository.updateWithSessions).toHaveBeenCalledWith(
                1,
                { note: "Late" },
                10,
                undefined
            )
        })

        it("should throw NotFoundException when attendance does not exist", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(null)

            await expect(service.update(99, { isPresent: true })).rejects.toThrow(NotFoundException)
            expect(mockAttendanceRepository.updateWithSessions).not.toHaveBeenCalled()
        })

        it("should throw NotFoundException when repository did not update anything", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(createFakeAttendance(false))
            mockAttendanceRepository.updateWithSessions.mockResolvedValue(false)

            await expect(service.update(1, { isPresent: true })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should return session to subscription when deleted attendance was present", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(createFakeAttendance(true, 5))
            mockAttendanceRepository.deleteWithSessions.mockResolvedValue(true)

            await service.delete(1)

            expect(mockAttendanceRepository.deleteWithSessions).toHaveBeenCalledWith(
                1,
                10,
                { sessionsLeft: 6, isActive: true }
            )
        })

        it("should not change sessions when deleted attendance was absent", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(createFakeAttendance(false))
            mockAttendanceRepository.deleteWithSessions.mockResolvedValue(true)

            await service.delete(1)

            expect(mockAttendanceRepository.deleteWithSessions).toHaveBeenCalledWith(1, 10, undefined)
        })

        it("should throw NotFoundException when attendance does not exist", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(null)

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
            expect(mockAttendanceRepository.deleteWithSessions).not.toHaveBeenCalled()
        })

        it("should throw NotFoundException when repository did not delete anything", async () => {
            mockAttendanceRepository.findByIdWithSubscription.mockResolvedValue(createFakeAttendance(true))
            mockAttendanceRepository.deleteWithSessions.mockResolvedValue(false)

            await expect(service.delete(1)).rejects.toThrow(NotFoundException)
        })
    })
})