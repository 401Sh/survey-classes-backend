import { BadRequestException, NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { EnrollmentEntity } from "../entities/enrollment.entity"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { EnrollmentRepository } from "../abstracts/enrollment-repository.abstract"
import { GetManageEnrollmentListQueryDto } from "../dto"
import { ManageEnrollmentsService } from "../services/manage-enrollments.service"

const mockEnrollmentRepository = {
    findById: vi.fn(),
    findByIdWithDetails: vi.fn(),
    findPage: vi.fn(),
    updateStatus: vi.fn(),
}

describe("ManageEnrollmentsService", () => {
    let service: ManageEnrollmentsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageEnrollmentsService,
                { provide: EnrollmentRepository, useValue: mockEnrollmentRepository },
            ],
        }).compile()

        service = module.get(ManageEnrollmentsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        it("should return enrollments with pagination meta", async () => {
            const query = { page: 2, limit: 5, sortDirection: SortDirection.DESC } as GetManageEnrollmentListQueryDto
            const fakeEnrollments = [{ id: 1 }] as EnrollmentEntity[]
            mockEnrollmentRepository.findPage.mockResolvedValue([fakeEnrollments, 11])

            const result = await service.findAll(query)

            expect(mockEnrollmentRepository.findPage).toHaveBeenCalledWith(query)
            expect(result).toEqual({
                data: fakeEnrollments,
                meta: {
                    totalCount: 11,
                    totalPagesAmount: 3, // 11 записей по 5 на странице = 3 страницы
                    currentPage: 2,
                },
            })
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return enrollment when it exists", async () => {
            const fakeEnrollment = { id: 1 } as EnrollmentEntity
            mockEnrollmentRepository.findByIdWithDetails.mockResolvedValue(fakeEnrollment)

            const result = await service.findById(1)

            expect(result).toEqual(fakeEnrollment)
        })

        it("should throw NotFoundException when enrollment does not exist", async () => {
            mockEnrollmentRepository.findByIdWithDetails.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("activate", () => {
        it("should activate pending enrollment", async () => {
            mockEnrollmentRepository.findById.mockResolvedValue({ id: 1, status: EnrollmentStatus.PENDING })
            mockEnrollmentRepository.updateStatus.mockResolvedValue(true)

            await service.activate(1)

            expect(mockEnrollmentRepository.updateStatus).toHaveBeenCalledWith(1, EnrollmentStatus.ACTIVE)
        })

        it("should throw NotFoundException when enrollment does not exist", async () => {
            mockEnrollmentRepository.findById.mockResolvedValue(null)

            await expect(service.activate(99)).rejects.toThrow(NotFoundException)
        })

        it.each([EnrollmentStatus.ACTIVE, EnrollmentStatus.SUSPENDED])(
            "should throw BadRequestException when enrollment is %s",
            async (status) => {
                mockEnrollmentRepository.findById.mockResolvedValue({ id: 1, status })

                await expect(service.activate(1)).rejects.toThrow(BadRequestException)
                expect(mockEnrollmentRepository.updateStatus).not.toHaveBeenCalled()
            }
        )

        it("should throw NotFoundException when status was not updated", async () => {
            mockEnrollmentRepository.findById.mockResolvedValue({ id: 1, status: EnrollmentStatus.PENDING })
            mockEnrollmentRepository.updateStatus.mockResolvedValue(false)

            await expect(service.activate(1)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("suspend", () => {
        it("should suspend active enrollment", async () => {
            mockEnrollmentRepository.findById.mockResolvedValue({ id: 1, status: EnrollmentStatus.ACTIVE })
            mockEnrollmentRepository.updateStatus.mockResolvedValue(true)

            await service.suspend(1)

            expect(mockEnrollmentRepository.updateStatus).toHaveBeenCalledWith(1, EnrollmentStatus.SUSPENDED)
        })

        it("should throw NotFoundException when enrollment does not exist", async () => {
            mockEnrollmentRepository.findById.mockResolvedValue(null)

            await expect(service.suspend(99)).rejects.toThrow(NotFoundException)
        })

        it.each([EnrollmentStatus.PENDING, EnrollmentStatus.SUSPENDED])(
            "should throw BadRequestException when enrollment is %s",
            async (status) => {
                mockEnrollmentRepository.findById.mockResolvedValue({ id: 1, status })

                await expect(service.suspend(1)).rejects.toThrow(BadRequestException)
                expect(mockEnrollmentRepository.updateStatus).not.toHaveBeenCalled()
            }
        )

        it("should throw NotFoundException when status was not updated", async () => {
            mockEnrollmentRepository.findById.mockResolvedValue({ id: 1, status: EnrollmentStatus.ACTIVE })
            mockEnrollmentRepository.updateStatus.mockResolvedValue(false)

            await expect(service.suspend(1)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("unsuspend", () => {
        it("should re-activate suspended enrollment", async () => {
            mockEnrollmentRepository.findById.mockResolvedValue({ id: 1, status: EnrollmentStatus.SUSPENDED })
            mockEnrollmentRepository.updateStatus.mockResolvedValue(true)

            await service.unsuspend(1)

            expect(mockEnrollmentRepository.updateStatus).toHaveBeenCalledWith(1, EnrollmentStatus.ACTIVE)
        })

        it("should throw NotFoundException when enrollment does not exist", async () => {
            mockEnrollmentRepository.findById.mockResolvedValue(null)

            await expect(service.unsuspend(99)).rejects.toThrow(NotFoundException)
        })

        it.each([EnrollmentStatus.PENDING, EnrollmentStatus.ACTIVE])(
            "should throw BadRequestException when enrollment is %s",
            async (status) => {
                mockEnrollmentRepository.findById.mockResolvedValue({ id: 1, status })

                await expect(service.unsuspend(1)).rejects.toThrow(BadRequestException)
                expect(mockEnrollmentRepository.updateStatus).not.toHaveBeenCalled()
            }
        )

        it("should throw NotFoundException when status was not updated", async () => {
            mockEnrollmentRepository.findById.mockResolvedValue({ id: 1, status: EnrollmentStatus.SUSPENDED })
            mockEnrollmentRepository.updateStatus.mockResolvedValue(false)

            await expect(service.unsuspend(1)).rejects.toThrow(NotFoundException)
        })
    })
})