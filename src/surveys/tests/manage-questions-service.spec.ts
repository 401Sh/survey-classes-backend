import { NotFoundException, BadRequestException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { QuestionOptionEntity } from "../entities/question-option.entity"
import { QuestionEntity } from "../entities/question.entity"
import { QuestionType } from "../enums/question-type.enum"
import { ManageQuestionsService } from "../services/manage-questions.service"

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
        // saving qb for checking calls in tests
        _qb: qb,
    }
}

const mockQuestionRepository = {
    findOne: vi.fn(),
    exists: vi.fn(),
    manager: {
        // transaction calls callback and passing transactionManager
        transaction: vi.fn(),
    },
}

const mockQuestionOptionRepository = {
    findOne: vi.fn(),
    find: vi.fn(),
    save: vi.fn(),
}

describe("ManageQuestionsService", () => {
    let service: ManageQuestionsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageQuestionsService,
                {
                    provide: getRepositoryToken(QuestionEntity),
                    useValue: mockQuestionRepository,
                },
                {
                    provide: getRepositoryToken(QuestionOptionEntity),
                    useValue: mockQuestionOptionRepository,
                },
            ],
        }).compile()

        service = module.get<ManageQuestionsService>(ManageQuestionsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("createQuestionOption", () => {
        it("should create option with position 1 when no options exist", async () => {
            const fakeQuestion = { id: 1, type: QuestionType.RADIO } as unknown as QuestionEntity
            const fakeOption = { id: 1, position: 1 } as unknown as QuestionOptionEntity

            mockQuestionRepository.findOne.mockResolvedValue(fakeQuestion)
            mockQuestionOptionRepository.findOne.mockResolvedValue(null)
            mockQuestionOptionRepository.save.mockResolvedValue(fakeOption)

            const result = await service.createQuestionOption(1, { label: "Option A" })

            expect(result).toEqual(fakeOption)
            expect(mockQuestionOptionRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ position: 1 })
            )
        })

        it("should create option with position = lastPosition + 1", async () => {
            const fakeQuestion = { id: 1, type: QuestionType.RADIO } as unknown as QuestionEntity
            const lastOption = { id: 3, position: 4 } as unknown as QuestionOptionEntity
            const fakeOption = { id: 4, position: 5 } as unknown as QuestionOptionEntity

            mockQuestionRepository.findOne.mockResolvedValue(fakeQuestion)
            mockQuestionOptionRepository.findOne.mockResolvedValue(lastOption)
            mockQuestionOptionRepository.save.mockResolvedValue(fakeOption)

            await service.createQuestionOption(1, { label: "Option B" })

            expect(mockQuestionOptionRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ position: 5 })
            )
        })

        it("should throw NotFoundException when question does not exist", async () => {
            mockQuestionRepository.findOne.mockResolvedValue(null)

            await expect(service.createQuestionOption(99, { label: "X" }))
                .rejects.toThrow(NotFoundException)
        })

        it("should throw BadRequestException for TEXT question", async () => {
            const fakeQuestion = { id: 1, type: QuestionType.TEXT } as unknown as QuestionEntity
            mockQuestionRepository.findOne.mockResolvedValue(fakeQuestion)

            await expect(service.createQuestionOption(1, { label: "X" }))
                .rejects.toThrow(BadRequestException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return question when it exists", async () => {
            const fakeQuestion = { id: 1, options: [] } as unknown as QuestionEntity
            mockQuestionRepository.findOne.mockResolvedValue(fakeQuestion)

            const result = await service.findById(1)

            expect(result).toEqual(fakeQuestion)
        })

        it("should return null when question does not exist", async () => {
            mockQuestionRepository.findOne.mockResolvedValue(null)

            const result = await service.findById(99)

            // TODO: remove null return
            expect(result).toBeNull()
        })
    })

    // -------------------------------------------------------------------------

    describe("findAllOptionsByQuestionId", () => {
        it("should return options for existing question", async () => {
            const fakeOptions = [{ id: 1 }, { id: 2 }] as unknown as QuestionOptionEntity[]
            mockQuestionRepository.exists.mockResolvedValue(true)
            mockQuestionOptionRepository.find.mockResolvedValue(fakeOptions)

            const result = await service.findAllOptionsByQuestionId(1)

            expect(result).toEqual(fakeOptions)
        })

        it("should throw NotFoundException when question does not exist", async () => {
            mockQuestionRepository.exists.mockResolvedValue(false)

            await expect(service.findAllOptionsByQuestionId(99))
                .rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        // helper — setting up transaction mock in a way that he can call callbacks
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockQuestionRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<void>) => cb(managerMock)
            )
        }

        it("should update question without position change", async () => {
            const manager = createTransactionManagerMock()
            const fakeQuestion = {
                id: 1,
                position: 2,
                type: QuestionType.TEXT,
                survey: { id: 10 },
            } as unknown as QuestionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeQuestion)
            manager.update.mockResolvedValue({ affected: 1 })

            await expect(service.update(1, { label: "Updated" })).resolves.not.toThrow()
        })

        it("should throw NotFoundException when question does not exist", async () => {
            const manager = createTransactionManagerMock()
            setupTransaction(manager)
            manager.findOne.mockResolvedValue(null)

            await expect(service.update(99, { label: "X" })).rejects.toThrow(NotFoundException)
        })

        it("should shift other questions when position changes", async () => {
            const manager = createTransactionManagerMock()
            const fakeQuestion = {
                id: 1,
                position: 2,
                type: QuestionType.TEXT,
                survey: { id: 10 },
            } as unknown as QuestionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeQuestion)
            manager.maximum.mockResolvedValue(5) // only 5 questions
            manager.update.mockResolvedValue({ affected: 1 })

            await service.update(1, { position: 4 })

            // queryBuilder must perform questions shifting
            expect(manager._qb.execute).toHaveBeenCalled()
        })

        it("should delete options when type changes to TEXT", async () => {
            const manager = createTransactionManagerMock()
            const fakeQuestion = {
                id: 1,
                position: 1,
                type: QuestionType.CHECKBOX,
                survey: { id: 10 },
            } as unknown as QuestionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeQuestion)
            manager.update.mockResolvedValue({ affected: 1 })

            await service.update(1, { type: QuestionType.TEXT })

            expect(manager.delete).toHaveBeenCalledWith(
                QuestionOptionEntity,
                { question: { id: 1 } }
            )
        })

        it("should not delete options when type stays TEXT", async () => {
            const manager = createTransactionManagerMock()
            const fakeQuestion = {
                id: 1,
                position: 1,
                type: QuestionType.TEXT,
                survey: { id: 10 },
            } as unknown as QuestionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeQuestion)
            manager.update.mockResolvedValue({ affected: 1 })

            await service.update(1, { type: QuestionType.TEXT })

            expect(manager.delete).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockQuestionRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<void>) => cb(managerMock)
            )
        }

        it("should delete question and shift positions", async () => {
            const manager = createTransactionManagerMock()
            const fakeQuestion = {
                id: 1,
                position: 2,
                survey: { id: 10 },
            } as unknown as QuestionEntity

            setupTransaction(manager)
            manager.findOne.mockResolvedValue(fakeQuestion)

            await expect(service.delete(1)).resolves.not.toThrow()

            // questions under removed question must go higher
            expect(manager._qb.execute).toHaveBeenCalled()
            expect(manager.delete).toHaveBeenCalledWith(QuestionEntity, { id: 1 })
        })

        it("should throw NotFoundException when question does not exist", async () => {
            const manager = createTransactionManagerMock()
            setupTransaction(manager)
            manager.findOne.mockResolvedValue(null)

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})