import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { AttendanceEntity } from "../entities/attendance.entity"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { ManageAttendancesService } from "../services/manage-attendances.service"
import { SortDirection } from "src/common/enums/sort-direction.enum"

const createTransactionManagerMock = () => {
    return {
        findOne: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    }
}

const createQueryBuilderMock = () => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
})

const mockAttendanceRepository = {
    createQueryBuilder: vi.fn(),
    manager: {
        transaction: vi.fn(),
    },
}

describe("ManageAttendancesService", () => {
    let service: ManageAttendancesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageAttendancesService,
                {
                    provide: getRepositoryToken(AttendanceEntity),
                    useValue: mockAttendanceRepository,
                },
            ],
        }).compile()

        service = module.get<ManageAttendancesService>(ManageAttendancesService)
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
            const fakeAttendances = [{ id: 1 }, { id: 2 }] as unknown as AttendanceEntity[]
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([fakeAttendances, 2])
            mockAttendanceRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll(baseQuery)

            expect(result.data).toEqual(fakeAttendances)
            expect(result.meta).toEqual({
                totalCount: 2,
                totalPagesAmount: 1,
                currentPage: 1,
            })
        })

        it("should calculate totalPagesAmount correctly", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 25])
            mockAttendanceRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll({ ...baseQuery, limit: 10 })

            expect(result.meta.totalPagesAmount).toBe(3)
        })

        it("should apply isPresent filter when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockAttendanceRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, isPresent: true })

            expect(qb.andWhere).toHaveBeenCalledWith(
                "attendances.isPresent = :isPresent",
                { isPresent: true }
            )
        })

        it("should not apply isPresent filter when not provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockAttendanceRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll(baseQuery)

            const andWhereCalls = qb.andWhere.mock.calls.map((c: any[]) => c[0])
            expect(andWhereCalls).not.toContain("attendances.isPresent = :isPresent")
        })

        it("should apply dateFrom and dateTo filters when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockAttendanceRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, dateFrom: new Date("2024-01-01"), dateTo: new Date("2024-12-31") })

            expect(qb.andWhere).toHaveBeenCalledWith(
                "attendances.date >= :dateFrom",
                { dateFrom: new Date("2024-01-01") }
            )
            expect(qb.andWhere).toHaveBeenCalledWith(
                "attendances.date <= :dateTo",
                { dateTo: new Date("2024-12-31") }
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockAttendanceRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<void>) => cb(managerMock)
            )
        }

        it("should update attendance without changing isPresent", async () => {
            const manager = createTransactionManagerMock()
            const fakeAttendance = {
                id: 1,
                isPresent: true,
                subscription: { id: 10, sessionsLeft: 3 },
            } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeAttendance)
            manager.update.mockResolvedValue({ affected: 1 })

            // передаём data без isPresent — подписка не должна меняться
            await expect(service.update(1, {})).resolves.not.toThrow()

            expect(manager.update).toHaveBeenCalledTimes(1) // только attendance, не subscription
        })

        it("should decrement sessionsLeft when isPresent changes to true", async () => {
            const manager = createTransactionManagerMock()
            const fakeAttendance = {
                id: 1,
                isPresent: false, // было false
                subscription: { id: 10, sessionsLeft: 3, isActive: true },
            } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeAttendance)
            manager.update.mockResolvedValue({ affected: 1 })

            await service.update(1, { isPresent: true }) // стало true

            expect(manager.update).toHaveBeenCalledWith(
                SubscriptionEntity,
                { id: 10 },
                { sessionsLeft: 2, isActive: true }
            )
        })

        it("should increment sessionsLeft when isPresent changes to false", async () => {
            const manager = createTransactionManagerMock()
            const fakeAttendance = {
                id: 1,
                isPresent: true, // было true
                subscription: { id: 10, sessionsLeft: 0, isActive: false },
            } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeAttendance)
            manager.update.mockResolvedValue({ affected: 1 })

            await service.update(1, { isPresent: false }) // стало false

            expect(manager.update).toHaveBeenCalledWith(
                SubscriptionEntity,
                { id: 10 },
                { sessionsLeft: 1, isActive: true }
            )
        })

        it("should set isActive to false when sessionsLeft reaches zero", async () => {
            const manager = createTransactionManagerMock()
            const fakeAttendance = {
                id: 1,
                isPresent: false,
                subscription: { id: 10, sessionsLeft: 1, isActive: true },
            } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeAttendance)
            manager.update.mockResolvedValue({ affected: 1 })

            await service.update(1, { isPresent: true })

            expect(manager.update).toHaveBeenCalledWith(
                SubscriptionEntity,
                { id: 10 },
                { sessionsLeft: 0, isActive: false }
            )
        })

        it("should not update subscription when isPresent value does not change", async () => {
            const manager = createTransactionManagerMock()
            const fakeAttendance = {
                id: 1,
                isPresent: true, // уже true
                subscription: { id: 10, sessionsLeft: 2 },
            } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeAttendance)
            manager.update.mockResolvedValue({ affected: 1 })

            await service.update(1, { isPresent: true }) // передаём то же значение

            expect(manager.update).toHaveBeenCalledTimes(1) // только attendance
        })

        it("should throw NotFoundException when attendance does not exist", async () => {
            const manager = createTransactionManagerMock()
            setupTransaction(manager)
            manager.findOne.mockResolvedValue(null)

            await expect(service.update(99, { isPresent: true })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockAttendanceRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<void>) => cb(managerMock)
            )
        }

        it("should delete attendance without restoring session when isPresent is false", async () => {
            const manager = createTransactionManagerMock()
            const fakeAttendance = {
                id: 1,
                isPresent: false, // занятие не было посещено — сессию не возвращаем
                subscription: { id: 10, sessionsLeft: 2 },
            } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeAttendance)
            manager.delete.mockResolvedValue({ affected: 1 })

            await expect(service.delete(1)).resolves.not.toThrow()

            expect(manager.update).not.toHaveBeenCalled()
            expect(manager.delete).toHaveBeenCalledWith(AttendanceEntity, { id: 1 })
        })

        it("should restore session when deleting attended attendance", async () => {
            const manager = createTransactionManagerMock()
            const fakeAttendance = {
                id: 1,
                isPresent: true, // занятие было посещено — возвращаем сессию
                subscription: { id: 10, sessionsLeft: 0, isActive: false },
            } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeAttendance)
            manager.delete.mockResolvedValue({ affected: 1 })

            await service.delete(1)

            expect(manager.update).toHaveBeenCalledWith(
                SubscriptionEntity,
                { id: 10 },
                { sessionsLeft: 1, isActive: true }
            )
        })

        it("should throw NotFoundException when attendance does not exist", async () => {
            const manager = createTransactionManagerMock()
            setupTransaction(manager)
            manager.findOne.mockResolvedValue(null)

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when delete affects no rows", async () => {
            const manager = createTransactionManagerMock()
            const fakeAttendance = {
                id: 1,
                isPresent: false,
                subscription: { id: 10, sessionsLeft: 2 },
            } as unknown as AttendanceEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeAttendance)
            manager.delete.mockResolvedValue({ affected: 0 })

            await expect(service.delete(1)).rejects.toThrow(NotFoundException)
        })
    })
})