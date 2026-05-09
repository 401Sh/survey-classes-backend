import { BadRequestException, NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { EnrollmentsInternalService } from "src/enrollments/services/enrollments-internal.service"
import { QuestionType } from "src/surveys/enums/question-type.enum"
import { QuestionsInternalService } from "src/surveys/services/questions-internal.service"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { AnswerEntity } from "../entities/answer.entity"
import { ApplicationEntity } from "../entities/application.entity"
import { ApplicationStatus } from "../enums/application-status.enum"
import { ApplicationsService } from "../services/applications.service"

const createTransactionManagerMock = () => ({
    save: vi.fn(),
    delete: vi.fn(),
})

const mockApplicationRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    exists: vi.fn(),
    manager: {
        transaction: vi.fn(),
    },
}

const mockEnrollmentsService = {
    findOwnedWithLessonAndSurvey: vi.fn(),
}

const mockQuestionsInternalService = {
    findByIdsAndSurveyIdInTransaction: vi.fn(),
}

describe("ApplicationsService", () => {
    let service: ApplicationsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationsService,
                {
                    provide: getRepositoryToken(ApplicationEntity),
                    useValue: mockApplicationRepository,
                },
                {
                    provide: EnrollmentsInternalService,
                    useValue: mockEnrollmentsService,
                },
                {
                    provide: QuestionsInternalService,
                    useValue: mockQuestionsInternalService,
                },
            ],
        }).compile()

        service = module.get<ApplicationsService>(ApplicationsService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("create", () => {
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockApplicationRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<any>) => cb(managerMock)
            )
        }

        const fakeEnrollmentWithSurvey = {
            id: 1,
            lesson: {
                id: 10,
                requiresSurvey: true,
                survey: { id: 5 },
            },
        }

        it("should create application with text answers", async () => {
            const manager = createTransactionManagerMock()
            const fakeApplication = { id: 1 } as unknown as ApplicationEntity
            const fakeQuestion = {
                id: 1,
                type: QuestionType.TEXT,
                options: [],
            }

            mockEnrollmentsService.findOwnedWithLessonAndSurvey.mockResolvedValue(fakeEnrollmentWithSurvey)
            mockApplicationRepository.exists.mockResolvedValue(false)
            setupTransaction(manager)
            manager.save.mockResolvedValueOnce(fakeApplication)
            mockQuestionsInternalService.findByIdsAndSurveyIdInTransaction.mockResolvedValue([fakeQuestion])
            manager.save.mockResolvedValueOnce(undefined)

            const result = await service.create(1, {
                enrollmentId: 1,
                answers: [{ questionId: 1, textValue: "Some answer" }],
            })

            expect(result).toEqual(fakeApplication)
        })

        it("should create application with option answers", async () => {
            const manager = createTransactionManagerMock()
            const fakeApplication = { id: 1 } as unknown as ApplicationEntity
            const fakeQuestion = {
                id: 1,
                type: QuestionType.RADIO,
                options: [{ id: 10 }, { id: 11 }],
            }

            mockEnrollmentsService.findOwnedWithLessonAndSurvey.mockResolvedValue(fakeEnrollmentWithSurvey)
            mockApplicationRepository.exists.mockResolvedValue(false)
            setupTransaction(manager)
            manager.save.mockResolvedValueOnce(fakeApplication)
            mockQuestionsInternalService.findByIdsAndSurveyIdInTransaction.mockResolvedValue([fakeQuestion])
            manager.save.mockResolvedValueOnce(undefined)

            await service.create(1, {
                enrollmentId: 1,
                answers: [{ questionId: 1, selectedOptionIds: [10] }],
            })

            expect(manager.save).toHaveBeenCalledWith(
                AnswerEntity,
                expect.arrayContaining([
                    expect.objectContaining({ selectedOption: { id: 10 } }),
                ])
            )
        })

        it("should throw BadRequestException when lesson does not require survey", async () => {
            mockEnrollmentsService.findOwnedWithLessonAndSurvey.mockResolvedValue({
                id: 1,
                lesson: { id: 10, requiresSurvey: false, survey: null },
            })

            await expect(service.create(1, { enrollmentId: 1, answers: [] }))
                .rejects.toThrow(BadRequestException)
        })

        it("should throw BadRequestException when lesson has no active survey", async () => {
            mockEnrollmentsService.findOwnedWithLessonAndSurvey.mockResolvedValue({
                id: 1,
                lesson: { id: 10, requiresSurvey: true, survey: null },
            })

            await expect(service.create(1, { enrollmentId: 1, answers: [] }))
                .rejects.toThrow(BadRequestException)
        })

        it("should throw BadRequestException when application already exists for enrollment", async () => {
            mockEnrollmentsService.findOwnedWithLessonAndSurvey.mockResolvedValue(fakeEnrollmentWithSurvey)
            mockApplicationRepository.exists.mockResolvedValue(true)

            await expect(service.create(1, { enrollmentId: 1, answers: [] }))
                .rejects.toThrow(BadRequestException)
        })

        it("should throw NotFoundException when enrollment does not exist or not owned", async () => {
            mockEnrollmentsService.findOwnedWithLessonAndSurvey.mockRejectedValue(new NotFoundException())

            await expect(service.create(1, { enrollmentId: 99, answers: [] }))
                .rejects.toThrow(NotFoundException)
        })

        it("should throw BadRequestException when answer contains invalid questions", async () => {
            const manager = createTransactionManagerMock()
            const fakeApplication = { id: 1 } as unknown as ApplicationEntity

            mockEnrollmentsService.findOwnedWithLessonAndSurvey.mockResolvedValue(fakeEnrollmentWithSurvey)
            mockApplicationRepository.exists.mockResolvedValue(false)
            setupTransaction(manager)
            manager.save.mockResolvedValueOnce(fakeApplication)

            mockQuestionsInternalService.findByIdsAndSurveyIdInTransaction.mockResolvedValue([])

            await expect(service.create(1, {
                enrollmentId: 1,
                answers: [{ questionId: 99, textValue: "answer" }],
            })).rejects.toThrow(BadRequestException)
        })

        it("should throw BadRequestException when answer contains invalid options", async () => {
            const manager = createTransactionManagerMock()
            const fakeApplication = { id: 1 } as unknown as ApplicationEntity
            const fakeQuestion = {
                id: 1,
                type: QuestionType.RADIO,
                options: [{ id: 10 }], // valid option
            }

            mockEnrollmentsService.findOwnedWithLessonAndSurvey.mockResolvedValue(fakeEnrollmentWithSurvey)
            mockApplicationRepository.exists.mockResolvedValue(false)
            setupTransaction(manager)
            manager.save.mockResolvedValueOnce(fakeApplication)
            mockQuestionsInternalService.findByIdsAndSurveyIdInTransaction.mockResolvedValue([fakeQuestion])

            await expect(service.create(1, {
                enrollmentId: 1,
                answers: [{ questionId: 1, selectedOptionIds: [99] }], // invalid option
            })).rejects.toThrow(BadRequestException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        it("should return applications for user", async () => {
            const fakeApplications = [{ id: 1 }, { id: 2 }] as unknown as ApplicationEntity[]
            mockApplicationRepository.find.mockResolvedValue(fakeApplications)

            const result = await service.findAll(1)

            expect(result).toEqual(fakeApplications)
        })

        it("should return empty array when user has no applications", async () => {
            mockApplicationRepository.find.mockResolvedValue([])

            const result = await service.findAll(1)

            expect(result).toEqual([])
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return application when it exists and belongs to user", async () => {
            const fakeApplication = { id: 1 } as unknown as ApplicationEntity
            mockApplicationRepository.findOne.mockResolvedValue(fakeApplication)

            const result = await service.findById(1, 1)

            expect(result).toEqual(fakeApplication)
        })

        it("should throw NotFoundException when application does not exist or belongs to another user", async () => {
            mockApplicationRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(1, 99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockApplicationRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<void>) => cb(managerMock)
            )
        }

        it("should update answers for pending application", async () => {
            const manager = createTransactionManagerMock()
            const fakeApplication = {
                id: 1,
                status: ApplicationStatus.PENDING,
                survey: { id: 5 },
                answers: [],
            } as unknown as ApplicationEntity

            const fakeQuestion = { id: 1, type: QuestionType.TEXT, options: [] }

            mockApplicationRepository.findOne.mockResolvedValue(fakeApplication)
            setupTransaction(manager)
            mockQuestionsInternalService.findByIdsAndSurveyIdInTransaction.mockResolvedValue([fakeQuestion])

            await expect(service.update(1, 1, {
                answers: [{ questionId: 1, textValue: "Updated answer" }],
            })).resolves.not.toThrow()

            // old answers deleted
            expect(manager.delete).toHaveBeenCalledWith(
                AnswerEntity,
                { response: { id: 1 } }
            )
            // new answers saved
            expect(manager.save).toHaveBeenCalledWith(
                AnswerEntity,
                expect.arrayContaining([
                    expect.objectContaining({ textValue: "Updated answer" }),
                ])
            )
        })

        it("should throw NotFoundException when application does not exist, not pending, or not owned", async () => {
            mockApplicationRepository.findOne.mockResolvedValue(null)

            await expect(service.update(1, 99, { answers: [] })).rejects.toThrow(NotFoundException)
        })
    })
})