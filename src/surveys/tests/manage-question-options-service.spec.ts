import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { QuestionOptionEntity } from "../entities/question-option.entity"
import { ManageQuestionOptionsService } from "../services/manage-question-options.service"

const createTransactionManagerMock = () => {
    const qb = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(undefined),
    }

    return {
        findOne: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        maximum: vi.fn(),
        createQueryBuilder: vi.fn().mockReturnValue(qb),
        _qb: qb,
    }
}

const mockQuestionOptionsRepository = {
    findOne: vi.fn(),
    manager: {
        transaction: vi.fn(),
    },
}

describe("ManageQuestionOptionsService", () => {
    let service: ManageQuestionOptionsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageQuestionOptionsService,
                {
                    provide: getRepositoryToken(QuestionOptionEntity),
                    useValue: mockQuestionOptionsRepository,
                },
            ],
        }).compile()

        service = module.get<ManageQuestionOptionsService>(ManageQuestionOptionsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return option when it exists", async () => {
            const fakeOption = { id: 1, label: "Option A" } as unknown as QuestionOptionEntity
            mockQuestionOptionsRepository.findOne.mockResolvedValue(fakeOption)

            const result = await service.findById(1)

            expect(result).toEqual(fakeOption)
        })

        it("should return null when option does not exist", async () => {
            mockQuestionOptionsRepository.findOne.mockResolvedValue(null)

            const result = await service.findById(99)

            expect(result).toBeNull()
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockQuestionOptionsRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<void>) => cb(managerMock)
            )
        }

        it("should update option without position change", async () => {
            const manager = createTransactionManagerMock()
            const fakeOption = {
                id: 1,
                position: 2,
                question: { id: 10 },
            } as unknown as QuestionOptionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeOption)
            manager.update.mockResolvedValue({ affected: 1 })

            await expect(service.update(1, { label: "Updated" })).resolves.not.toThrow()
        })

        it("should throw NotFoundException when option does not exist", async () => {
            const manager = createTransactionManagerMock()
            setupTransaction(manager)
            manager.findOne.mockResolvedValue(null)

            await expect(service.update(99, { label: "X" })).rejects.toThrow(NotFoundException)
        })

        it("should shift options down when moving option to higher position", async () => {
            const manager = createTransactionManagerMock()
            const fakeOption = {
                id: 1,
                position: 1, // current position
                question: { id: 10 },
            } as unknown as QuestionOptionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeOption)
            manager.maximum.mockResolvedValue(4)
            manager.update.mockResolvedValue({ affected: 1 })

            await service.update(1, { position: 3 }) // moving down

            expect(manager._qb.execute).toHaveBeenCalled()
        })

        it("should shift options up when moving option to lower position", async () => {
            const manager = createTransactionManagerMock()
            const fakeOption = {
                id: 1,
                position: 4, // current position
                question: { id: 10 },
            } as unknown as QuestionOptionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeOption)
            manager.maximum.mockResolvedValue(4)
            manager.update.mockResolvedValue({ affected: 1 })

            await service.update(1, { position: 2 }) // movind up

            expect(manager._qb.execute).toHaveBeenCalled()
        })

        it("should clamp position to maxPosition when requested position exceeds max", async () => {
            const manager = createTransactionManagerMock()
            const fakeOption = {
                id: 1,
                position: 1,
                question: { id: 10 },
            } as unknown as QuestionOptionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeOption)
            manager.maximum.mockResolvedValue(3) // 3 maximum
            manager.update.mockResolvedValue({ affected: 1 })

            await service.update(1, { position: 99 }) // call 99, must become 3

            expect(manager.update).toHaveBeenCalledWith(
                QuestionOptionEntity,
                { id: 1 },
                expect.objectContaining({ position: 3 })
            )
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockQuestionOptionsRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<void>) => cb(managerMock)
            )
        }

        it("should delete option and shift remaining options", async () => {
            const manager = createTransactionManagerMock()
            const fakeOption = {
                id: 1,
                position: 2,
                question: { id: 10 },
            } as unknown as QuestionOptionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeOption)

            await expect(service.delete(1)).resolves.not.toThrow()

            expect(manager._qb.execute).toHaveBeenCalled()
            expect(manager.delete).toHaveBeenCalledWith(QuestionOptionEntity, { id: 1 })
        })

        it("should throw NotFoundException when option does not exist", async () => {
            const manager = createTransactionManagerMock()
            setupTransaction(manager)
            manager.findOne.mockResolvedValue(null)

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})