import { NotFoundException, BadRequestException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { EnrollmentStatus } from "src/enrollments/enums/enrollment-status.enum"
import { EnrollmentsInternalService } from "src/enrollments/services/enrollments-internal.service"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { ApplicationEntity } from "../entities/application.entity"
import { ApplicationStatus } from "../enums/application-status.enum"
import { ManageApplicationsService } from "../services/manage-applications.service"
import { SortDirection } from "src/common/enums/sort-direction.enum"

const createTransactionManagerMock = () => ({
    update: vi.fn(),
})

const createQueryBuilderMock = () => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
})

const mockApplicationRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
    createQueryBuilder: vi.fn(),
    manager: {
        transaction: vi.fn(),
    },
}

const mockEnrollmentsService = {
    activateInTransaction: vi.fn(),
}

describe("ManageApplicationsService", () => {
    let service: ManageApplicationsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageApplicationsService,
                {
                    provide: getRepositoryToken(ApplicationEntity),
                    useValue: mockApplicationRepository,
                },
                {
                    provide: EnrollmentsInternalService,
                    useValue: mockEnrollmentsService,
                },
            ],
        }).compile()

        service = module.get<ManageApplicationsService>(ManageApplicationsService)
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
            const fakeApplications = [{ id: 1 }, { id: 2 }] as unknown as ApplicationEntity[]
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([fakeApplications, 2])
            mockApplicationRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll(baseQuery)

            expect(result.data).toEqual(fakeApplications)
            expect(result.meta).toEqual({
                totalCount: 2,
                totalPagesAmount: 1,
                currentPage: 1,
            })
        })

        it("should calculate totalPagesAmount correctly", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 25])
            mockApplicationRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll({ ...baseQuery, limit: 10 })

            expect(result.meta.totalPagesAmount).toBe(3)
        })

        it("should apply status filter when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockApplicationRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, status: ApplicationStatus.PENDING })

            expect(qb.where).toHaveBeenCalledWith(
                "applications.status = :status",
                { status: ApplicationStatus.PENDING }
            )
        })

        it("should apply dateFrom and dateTo filters when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockApplicationRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, dateFrom: new Date("2024-01-01"), dateTo: new Date("2024-12-31") })

            expect(qb.andWhere).toHaveBeenCalledWith(
                "applications.createdAt >= :dateFrom",
                { dateFrom: new Date("2024-01-01") }
            )
            expect(qb.andWhere).toHaveBeenCalledWith(
                "applications.createdAt <= :dateTo",
                { dateTo: new Date("2024-12-31") }
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return application when it exists", async () => {
            const fakeApplication = { id: 1 } as unknown as ApplicationEntity
            mockApplicationRepository.findOne.mockResolvedValue(fakeApplication)

            const result = await service.findById(1)

            expect(result).toEqual(fakeApplication)
        })

        it("should throw NotFoundException when application does not exist", async () => {
            mockApplicationRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("approve", () => {
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockApplicationRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<void>) => cb(managerMock)
            )
        }

        it("should approve pending application and activate pending enrollment", async () => {
            const manager = createTransactionManagerMock()
            const fakeApplication = {
                id: 1,
                status: ApplicationStatus.PENDING,
                enrollment: { id: 10, status: EnrollmentStatus.PENDING },
            } as unknown as ApplicationEntity

            mockApplicationRepository.findOne.mockResolvedValue(fakeApplication)
            setupTransaction(manager)
            manager.update.mockResolvedValue({ affected: 1 })
            mockEnrollmentsService.activateInTransaction.mockResolvedValue(undefined)

            await expect(service.approve(1)).resolves.not.toThrow()

            expect(manager.update).toHaveBeenCalledWith(
                ApplicationEntity,
                { id: 1 },
                { status: ApplicationStatus.APPROVED }
            )
            expect(mockEnrollmentsService.activateInTransaction).toHaveBeenCalledWith(10, manager)
        })

        it("should approve application without activating enrollment when enrollment is already active", async () => {
            const manager = createTransactionManagerMock()
            const fakeApplication = {
                id: 1,
                status: ApplicationStatus.PENDING,
                enrollment: { id: 10, status: EnrollmentStatus.ACTIVE },
            } as unknown as ApplicationEntity

            mockApplicationRepository.findOne.mockResolvedValue(fakeApplication)
            setupTransaction(manager)
            manager.update.mockResolvedValue({ affected: 1 })

            await service.approve(1)

            expect(mockEnrollmentsService.activateInTransaction).not.toHaveBeenCalled()
        })

        it("should approve application when there is no enrollment", async () => {
            const manager = createTransactionManagerMock()
            const fakeApplication = {
                id: 1,
                status: ApplicationStatus.PENDING,
                enrollment: null,
            } as unknown as ApplicationEntity

            mockApplicationRepository.findOne.mockResolvedValue(fakeApplication)
            setupTransaction(manager)
            manager.update.mockResolvedValue({ affected: 1 })

            await expect(service.approve(1)).resolves.not.toThrow()

            expect(mockEnrollmentsService.activateInTransaction).not.toHaveBeenCalled()
        })

        it("should throw BadRequestException when application is not pending", async () => {
            const fakeApplication = {
                id: 1,
                status: ApplicationStatus.APPROVED,
                enrollment: null,
            } as unknown as ApplicationEntity

            mockApplicationRepository.findOne.mockResolvedValue(fakeApplication)

            await expect(service.approve(1)).rejects.toThrow(BadRequestException)
        })

        it("should throw NotFoundException when application does not exist", async () => {
            mockApplicationRepository.findOne.mockResolvedValue(null)

            await expect(service.approve(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("reject", () => {
        it("should reject pending application", async () => {
            const fakeApplication = {
                id: 1,
                status: ApplicationStatus.PENDING,
            } as unknown as ApplicationEntity

            mockApplicationRepository.findOne.mockResolvedValue(fakeApplication)
            mockApplicationRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.reject(1)).resolves.not.toThrow()

            expect(mockApplicationRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                { status: ApplicationStatus.REJECTED }
            )
        })

        it("should throw NotFoundException when application does not exist or already processed", async () => {
            mockApplicationRepository.findOne.mockResolvedValue(null)

            await expect(service.reject(99)).rejects.toThrow(NotFoundException)
        })
    })
})