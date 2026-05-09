import { NotFoundException, BadRequestException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ApplicationStatus } from "src/applications/enums/application-status.enum"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { ManageEnrollmentsService } from "../services/manage-enrollments.service"
import { SortDirection } from "src/common/enums/sort-direction.enum"

const createQueryBuilderMock = () => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
})

const mockEnrollmentRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
    createQueryBuilder: vi.fn(),
}

describe("ManageEnrollmentsService", () => {
    let service: ManageEnrollmentsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageEnrollmentsService,
                {
                    provide: getRepositoryToken(EnrollmentEntity),
                    useValue: mockEnrollmentRepository,
                },
            ],
        }).compile()

        service = module.get<ManageEnrollmentsService>(ManageEnrollmentsService)
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
            const fakeEnrollments = [{ id: 1 }, { id: 2 }] as unknown as EnrollmentEntity[]
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([fakeEnrollments, 2])
            mockEnrollmentRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll(baseQuery)

            expect(result.data).toEqual(fakeEnrollments)
            expect(result.meta).toEqual({
                totalCount: 2,
                totalPagesAmount: 1,
                currentPage: 1,
            })
        })

        it("should calculate totalPagesAmount correctly", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 25])
            mockEnrollmentRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll({ ...baseQuery, limit: 10 })

            expect(result.meta.totalPagesAmount).toBe(3)
        })

        it("should apply status filter when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockEnrollmentRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, status: EnrollmentStatus.ACTIVE })

            expect(qb.where).toHaveBeenCalledWith(
                "enrollments.status = :status",
                { status: EnrollmentStatus.ACTIVE }
            )
        })

        it("should apply dateFrom and dateTo filters when provided", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 0])
            mockEnrollmentRepository.createQueryBuilder.mockReturnValue(qb)

            await service.findAll({ ...baseQuery, dateFrom: new Date("2024-01-01"), dateTo: new Date("2024-12-31") })

            expect(qb.andWhere).toHaveBeenCalledWith(
                "enrollments.createdAt >= :dateFrom",
                { dateFrom: new Date("2024-01-01") }
            )
            expect(qb.andWhere).toHaveBeenCalledWith(
                "enrollments.createdAt <= :dateTo",
                { dateTo: new Date("2024-12-31") }
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return enrollment when it exists", async () => {
            const fakeEnrollment = { id: 1 } as unknown as EnrollmentEntity
            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)

            const result = await service.findById(1)

            expect(result).toEqual(fakeEnrollment)
        })

        it("should throw NotFoundException when enrollment does not exist", async () => {
            mockEnrollmentRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("activate", () => {
        it("should activate pending enrollment without application", async () => {
            const fakeEnrollment = {
                id: 1,
                status: EnrollmentStatus.PENDING,
                application: null,
            } as unknown as EnrollmentEntity

            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)
            mockEnrollmentRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.activate(1)).resolves.not.toThrow()

            expect(mockEnrollmentRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                { status: EnrollmentStatus.ACTIVE }
            )
        })

        it("should activate pending enrollment with approved application", async () => {
            const fakeEnrollment = {
                id: 1,
                status: EnrollmentStatus.PENDING,
                application: { id: 1, status: ApplicationStatus.APPROVED },
            } as unknown as EnrollmentEntity

            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)
            mockEnrollmentRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.activate(1)).resolves.not.toThrow()
        })

        it("should throw BadRequestException when enrollment is not pending", async () => {
            const fakeEnrollment = {
                id: 1,
                status: EnrollmentStatus.ACTIVE,
                application: null,
            } as unknown as EnrollmentEntity

            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)

            await expect(service.activate(1)).rejects.toThrow(BadRequestException)
        })

        it("should throw BadRequestException when application is not approved", async () => {
            const fakeEnrollment = {
                id: 1,
                status: EnrollmentStatus.PENDING,
                application: { id: 1, status: ApplicationStatus.PENDING },
            } as unknown as EnrollmentEntity

            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)

            await expect(service.activate(1)).rejects.toThrow(BadRequestException)
        })

        it("should throw NotFoundException when enrollment does not exist", async () => {
            mockEnrollmentRepository.findOne.mockResolvedValue(null)

            await expect(service.activate(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("suspend", () => {
        it("should suspend active enrollment", async () => {
            const fakeEnrollment = {
                id: 1,
                status: EnrollmentStatus.ACTIVE,
            } as unknown as EnrollmentEntity

            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)
            mockEnrollmentRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.suspend(1)).resolves.not.toThrow()

            expect(mockEnrollmentRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                { status: EnrollmentStatus.SUSPENDED }
            )
        })

        it("should throw BadRequestException when enrollment is not active", async () => {
            const fakeEnrollment = {
                id: 1,
                status: EnrollmentStatus.PENDING,
            } as unknown as EnrollmentEntity

            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)

            await expect(service.suspend(1)).rejects.toThrow(BadRequestException)
        })

        it("should throw NotFoundException when enrollment does not exist", async () => {
            mockEnrollmentRepository.findOne.mockResolvedValue(null)

            await expect(service.suspend(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("unsuspend", () => {
        it("should unsuspend suspended enrollment", async () => {
            const fakeEnrollment = {
                id: 1,
                status: EnrollmentStatus.SUSPENDED,
            } as unknown as EnrollmentEntity

            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)
            mockEnrollmentRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.unsuspend(1)).resolves.not.toThrow()

            expect(mockEnrollmentRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                { status: EnrollmentStatus.ACTIVE }
            )
        })

        it("should throw BadRequestException when enrollment is not suspended", async () => {
            const fakeEnrollment = {
                id: 1,
                status: EnrollmentStatus.ACTIVE,
            } as unknown as EnrollmentEntity

            mockEnrollmentRepository.findOne.mockResolvedValue(fakeEnrollment)

            await expect(service.unsuspend(1)).rejects.toThrow(BadRequestException)
        })

        it("should throw NotFoundException when enrollment does not exist", async () => {
            mockEnrollmentRepository.findOne.mockResolvedValue(null)

            await expect(service.unsuspend(99)).rejects.toThrow(NotFoundException)
        })
    })
})