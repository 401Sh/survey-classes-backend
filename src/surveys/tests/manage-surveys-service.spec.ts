import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { LessonsInternalService } from "src/lessons/services/lessons-internal.service"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { QuestionEntity } from "../entities/question.entity"
import { SurveyEntity } from "../entities/survey.entity"
import { ManageSurveysService } from "../services/manage-surveys.service"
import { QuestionType } from "../enums/question-type.enum"
import { SortDirection } from "src/common/enums/sort-direction.enum"

const mockSurveyRepository = {
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    exists: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createQueryBuilder: vi.fn(),
}

const mockQuestionRepository = {
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
}

const mockLessonsService = {
    exists: vi.fn(),
    updateSurveyRequirement: vi.fn(),
}

const createQueryBuilderMock = () => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    getManyAndCount: vi.fn(),
    relation: vi.fn().mockReturnThis(),
    of: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
})

describe("ManageSurveysService", () => {
    let service: ManageSurveysService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageSurveysService,
                {
                    provide: getRepositoryToken(SurveyEntity),
                    useValue: mockSurveyRepository,
                },
                {
                    provide: getRepositoryToken(QuestionEntity),
                    useValue: mockQuestionRepository,
                },
                {
                    provide: LessonsInternalService,
                    useValue: mockLessonsService,
                },
            ],
        }).compile()

        service = module.get<ManageSurveysService>(ManageSurveysService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("create", () => {
        it("should create survey without lessonId", async () => {
            const fakeSurvey = { id: 1, title: "Survey" } as unknown as SurveyEntity
            mockSurveyRepository.save.mockResolvedValue(fakeSurvey)

            const result = await service.create(1, { title: "Survey" })

            expect(result).toEqual(fakeSurvey)
            // no lessonId — lessonsService cannot be called
            expect(mockLessonsService.updateSurveyRequirement).not.toHaveBeenCalled()
        })

        it("should validate lesson and update requirement when lessonId provided", async () => {
            const fakeSurvey = { id: 1 } as unknown as SurveyEntity
            mockLessonsService.exists.mockResolvedValue(true)
            mockLessonsService.updateSurveyRequirement.mockResolvedValue(undefined)
            mockSurveyRepository.save.mockResolvedValue(fakeSurvey)

            await service.create(1, { title: "Survey", lessonId: 5 })

            expect(mockLessonsService.updateSurveyRequirement).toHaveBeenCalledWith(5, true)
        })

        it("should throw NotFoundException when lessonId provided but lesson does not exist", async () => {
            mockLessonsService.exists.mockResolvedValue(false)

            await expect(service.create(1, { title: "Survey", lessonId: 99 }))
                .rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("createQuestion", () => {
        it("should create question with position 1 when no questions exist yet", async () => {
            const fakeQuestion = { id: 1, position: 1 } as unknown as QuestionEntity
            mockSurveyRepository.exists.mockResolvedValue(true)
            mockQuestionRepository.findOne.mockResolvedValue(null) // no last question
            mockQuestionRepository.save.mockResolvedValue(fakeQuestion)

            const result = await service.createQuestion(1, { label: "Q1", type: QuestionType.TEXT })

            expect(result).toEqual(fakeQuestion)
            expect(mockQuestionRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ position: 1 })
            )
        })

        it("should create question with position = lastPosition + 1", async () => {
            const lastQuestion = { id: 3, position: 4 } as unknown as QuestionEntity
            const fakeQuestion = { id: 4, position: 5 } as unknown as QuestionEntity
            mockSurveyRepository.exists.mockResolvedValue(true)
            mockQuestionRepository.findOne.mockResolvedValue(lastQuestion)
            mockQuestionRepository.save.mockResolvedValue(fakeQuestion)

            await service.createQuestion(1, { label: "Q2", type: QuestionType.RADIO })

            expect(mockQuestionRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ position: 5 })
            )
        })

        it("should throw NotFoundException when survey does not exist", async () => {
            mockSurveyRepository.exists.mockResolvedValue(false)

            await expect(service.createQuestion(99, { label: "Q1", type: QuestionType.TEXT }))
                .rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("copy", () => {
        it("should copy survey without lessonId", async () => {
            const fakeSurvey = {
                id: 1,
                title: "Original",
                description: "Desc",
                createdBy: { id: 1 },
                questions: [],
            } as unknown as SurveyEntity

            const copiedSurvey = { id: 2, title: "Original" } as unknown as SurveyEntity

            mockSurveyRepository.findOne.mockResolvedValue(fakeSurvey)
            mockSurveyRepository.save.mockResolvedValue(copiedSurvey)

            const result = await service.copy(1, {})

            expect(result).toEqual(copiedSurvey)
            expect(mockLessonsService.updateSurveyRequirement).not.toHaveBeenCalled()
        })

        it("should copy survey with questions and options", async () => {
            const fakeSurvey = {
                id: 1,
                title: "Original",
                description: "Desc",
                createdBy: { id: 1 },
                questions: [
                    {
                        label: "Q1",
                        description: "D1",
                        type: "single",
                        position: 1,
                        options: [{ label: "Opt1", position: 1 }],
                    },
                ],
            } as unknown as SurveyEntity

            mockSurveyRepository.findOne.mockResolvedValue(fakeSurvey)
            mockSurveyRepository.save.mockResolvedValue({ id: 2 } as unknown as SurveyEntity)

            await service.copy(1, {})

            expect(mockSurveyRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    questions: expect.arrayContaining([
                        expect.objectContaining({
                            label: "Q1",
                            options: expect.arrayContaining([
                                expect.objectContaining({ label: "Opt1" })
                            ]),
                        }),
                    ]),
                })
            )
        })

        it("should throw NotFoundException when survey does not exist", async () => {
            mockSurveyRepository.findOne.mockResolvedValue(null)

            await expect(service.copy(99, {})).rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when lessonId provided but lesson does not exist", async () => {
            mockSurveyRepository.findOne.mockResolvedValue({
                id: 1, questions: [],
            } as unknown as SurveyEntity)
            mockLessonsService.exists.mockResolvedValue(false)

            await expect(service.copy(1, { lessonId: 99 })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        it("should return paginated result", async () => {
            const fakeSurveys = [{ id: 1 }, { id: 2 }] as unknown as SurveyEntity[]
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([fakeSurveys, 2])
            mockSurveyRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll({
                page: 1,
                limit: 10,
                sortDirection: SortDirection.DESC,
            })

            expect(result.data).toEqual(fakeSurveys)
            expect(result.meta).toEqual({
                totalCount: 2,
                totalPagesAmount: 1,
                currentPage: 1,
            })
        })

        it("should calculate totalPagesAmount correctly", async () => {
            const qb = createQueryBuilderMock()
            qb.getManyAndCount.mockResolvedValue([[], 25])
            mockSurveyRepository.createQueryBuilder.mockReturnValue(qb)

            const result = await service.findAll({ page: 1, limit: 10, sortDirection: SortDirection.DESC })

            // 25 records / 10 on page = 3 pages
            expect(result.meta.totalPagesAmount).toBe(3)
        })
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return survey when it exists", async () => {
            const fakeSurvey = { id: 1, title: "Test" } as unknown as SurveyEntity
            mockSurveyRepository.findOne.mockResolvedValue(fakeSurvey)

            const result = await service.findById(1)

            expect(result).toEqual(fakeSurvey)
        })

        it("should throw NotFoundException when survey does not exist", async () => {
            mockSurveyRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAllQuestionsBySurveyId", () => {
        it("should return questions for existing survey", async () => {
            const fakeQuestions = [{ id: 1 }, { id: 2 }] as unknown as QuestionEntity[]
            mockSurveyRepository.exists.mockResolvedValue(true)
            mockQuestionRepository.find.mockResolvedValue(fakeQuestions)

            const result = await service.findAllQuestionsBySurveyId(1)

            expect(result).toEqual(fakeQuestions)
        })

        it("should throw NotFoundException when survey does not exist", async () => {
            mockSurveyRepository.exists.mockResolvedValue(false)

            await expect(service.findAllQuestionsBySurveyId(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should update survey without changing lesson", async () => {
            const fakeSurvey = { id: 1, lesson: null } as unknown as SurveyEntity
            mockSurveyRepository.findOne.mockResolvedValue(fakeSurvey)
            mockSurveyRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.update(1, { title: "New title" })).resolves.not.toThrow()

            expect(mockLessonsService.updateSurveyRequirement).not.toHaveBeenCalled()
        })

        it("should untie old lesson and tie new lesson when lessonId changes", async () => {
            const fakeSurvey = {
                id: 1,
                lesson: { id: 3 }, // old lesson
            } as unknown as SurveyEntity
            const qb = createQueryBuilderMock()

            mockSurveyRepository.findOne.mockResolvedValue(fakeSurvey)
            mockSurveyRepository.update.mockResolvedValue({ affected: 1 })
            mockSurveyRepository.createQueryBuilder.mockReturnValue(qb)
            mockLessonsService.exists.mockResolvedValue(true)
            mockLessonsService.updateSurveyRequirement.mockResolvedValue(undefined)

            await service.update(1, { lessonId: 7 })

            // untied old lesson
            expect(mockLessonsService.updateSurveyRequirement).toHaveBeenCalledWith(3, false)
            // tied new lesson
            expect(mockLessonsService.updateSurveyRequirement).toHaveBeenCalledWith(7, true)
        })

        it("should throw NotFoundException when survey does not exist", async () => {
            mockSurveyRepository.findOne.mockResolvedValue(null)

            await expect(service.update(99, { title: "X" })).rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when new lessonId does not exist", async () => {
            mockSurveyRepository.findOne.mockResolvedValue({
                id: 1, lesson: null,
            } as unknown as SurveyEntity)
            mockLessonsService.exists.mockResolvedValue(false)

            await expect(service.update(1, { lessonId: 99 })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete survey without lesson", async () => {
            const fakeSurvey = { id: 1, lesson: null } as unknown as SurveyEntity
            mockSurveyRepository.findOne.mockResolvedValue(fakeSurvey)
            mockSurveyRepository.delete.mockResolvedValue({ affected: 1 })

            await expect(service.delete(1)).resolves.not.toThrow()

            expect(mockLessonsService.updateSurveyRequirement).not.toHaveBeenCalled()
        })

        it("should untie lesson before deleting survey", async () => {
            const fakeSurvey = {
                id: 1,
                lesson: { id: 3 },
            } as unknown as SurveyEntity
            mockSurveyRepository.findOne.mockResolvedValue(fakeSurvey)
            mockSurveyRepository.delete.mockResolvedValue({ affected: 1 })
            mockLessonsService.updateSurveyRequirement.mockResolvedValue(undefined)

            await service.delete(1)

            expect(mockLessonsService.updateSurveyRequirement).toHaveBeenCalledWith(3, false)
        })

        it("should throw NotFoundException when survey does not exist", async () => {
            mockSurveyRepository.findOne.mockResolvedValue(null)

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})