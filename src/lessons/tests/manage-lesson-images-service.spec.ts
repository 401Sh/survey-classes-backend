import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { MediaService } from "src/media/media.service"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonImageEntity } from "../entities/lesson-image.entity"
import { LessonEntity } from "../entities/lesson.entity"
import { ManageLessonImagesService } from "../services/manage-lesson-images.service"

const createTransactionManagerMock = () => ({
    update: vi.fn(),
    remove: vi.fn(),
    find: vi.fn(),
    save: vi.fn(),
})

const mockImageRepository = {
    findOne: vi.fn(),
    find: vi.fn(),
    save: vi.fn(),
    manager: {
        transaction: vi.fn(),
    },
}

const mockLessonRepository = {
    findOne: vi.fn(),
    exists: vi.fn(),
    update: vi.fn(),
    save: vi.fn(),
}

const mockMediaService = {
    saveFile: vi.fn(),
    deleteFile: vi.fn(),
}

describe("ManageLessonImagesService", () => {
    let service: ManageLessonImagesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManageLessonImagesService,
                {
                    provide: getRepositoryToken(LessonImageEntity),
                    useValue: mockImageRepository,
                },
                {
                    provide: getRepositoryToken(LessonEntity),
                    useValue: mockLessonRepository,
                },
                {
                    provide: MediaService,
                    useValue: mockMediaService,
                },
            ],
        }).compile()

        service = module.get<ManageLessonImagesService>(ManageLessonImagesService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("uploadImage", () => {
        const fakeFile = { originalname: "photo.jpg" } as Express.Multer.File

        it("should upload image with position 0 when no images exist", async () => {
            const fakeImage = { id: 1, position: 0 } as unknown as LessonImageEntity
            mockLessonRepository.exists.mockResolvedValue(true)
            mockImageRepository.findOne.mockResolvedValue(null) // последнего изображения нет
            mockMediaService.saveFile.mockResolvedValue("lessons/1/photo.jpg")
            mockImageRepository.save.mockResolvedValue(fakeImage)

            const result = await service.uploadImage(1, fakeFile)

            expect(result).toEqual(fakeImage)
            expect(mockImageRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ position: 0 })
            )
        })

        it("should upload image with position = lastPosition + 1", async () => {
            const lastImage = { id: 1, position: 2 } as unknown as LessonImageEntity
            const fakeImage = { id: 2, position: 3 } as unknown as LessonImageEntity
            mockLessonRepository.exists.mockResolvedValue(true)
            mockImageRepository.findOne.mockResolvedValue(lastImage)
            mockMediaService.saveFile.mockResolvedValue("lessons/1/photo.jpg")
            mockImageRepository.save.mockResolvedValue(fakeImage)

            await service.uploadImage(1, fakeFile)

            expect(mockImageRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ position: 3 })
            )
        })

        it("should save file to correct path", async () => {
            mockLessonRepository.exists.mockResolvedValue(true)
            mockImageRepository.findOne.mockResolvedValue(null)
            mockMediaService.saveFile.mockResolvedValue("lessons/1/photo.jpg")
            mockImageRepository.save.mockResolvedValue({ id: 1 } as unknown as LessonImageEntity)

            await service.uploadImage(1, fakeFile)

            expect(mockMediaService.saveFile).toHaveBeenCalledWith(
                fakeFile,
                expect.stringContaining("1") // путь содержит lessonId
            )
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.exists.mockResolvedValue(false)

            await expect(service.uploadImage(99, fakeFile)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        it("should return images for existing lesson", async () => {
            const fakeImages = [{ id: 1 }, { id: 2 }] as unknown as LessonImageEntity[]
            mockLessonRepository.exists.mockResolvedValue(true)
            mockImageRepository.find.mockResolvedValue(fakeImages)

            const result = await service.findAll(1)

            expect(result).toEqual(fakeImages)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.exists.mockResolvedValue(false)

            await expect(service.findAll(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("setCover", () => {
        it("should set cover image successfully", async () => {
            const fakeLesson = { id: 1, coverImage: null } as unknown as LessonEntity
            const fakeImage = { id: 1 } as unknown as LessonImageEntity
            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)
            mockImageRepository.findOne.mockResolvedValue(fakeImage)
            mockLessonRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.setCover(1, 1)).resolves.not.toThrow()

            expect(mockLessonRepository.update).toHaveBeenCalledWith(
                { id: 1 },
                { coverImage: { id: 1 } }
            )
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.findOne.mockResolvedValue(null)

            await expect(service.setCover(99, 1)).rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when image does not exist or belongs to another lesson", async () => {
            const fakeLesson = { id: 1 } as unknown as LessonEntity
            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)
            mockImageRepository.findOne.mockResolvedValue(null)

            await expect(service.setCover(1, 99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("remove", () => {
        const setupTransaction = (managerMock: ReturnType<typeof createTransactionManagerMock>) => {
            mockImageRepository.manager.transaction.mockImplementation(
                async (cb: (manager: any) => Promise<void>) => cb(managerMock)
            )
        }

        it("should remove image and reorder remaining images", async () => {
            const manager = createTransactionManagerMock()
            const fakeImage = {
                id: 1,
                path: "lessons/1/photo.jpg",
                lesson: { id: 1 },
            } as unknown as LessonImageEntity

            const remainingImages = [
                { id: 2, position: 1 },
                { id: 3, position: 2 },
            ] as unknown as LessonImageEntity[]

            mockImageRepository.findOne
                .mockResolvedValueOnce(fakeImage)  // получаем image
            mockLessonRepository.findOne.mockResolvedValue(null) // обложки нет
            setupTransaction(manager)
            manager.find.mockResolvedValue(remainingImages)
            manager.save.mockResolvedValue(undefined)
            mockMediaService.deleteFile.mockResolvedValue(undefined)

            await expect(service.remove(1, 1)).resolves.not.toThrow()

            // изображения переупорядочены — позиции пересчитаны с 0
            expect(manager.save).toHaveBeenCalledWith(
                LessonImageEntity,
                expect.arrayContaining([
                    expect.objectContaining({ position: 0 }),
                    expect.objectContaining({ position: 1 }),
                ])
            )
        })

        it("should delete file from storage", async () => {
            const manager = createTransactionManagerMock()
            const fakeImage = {
                id: 1,
                path: "lessons/1/photo.jpg",
                lesson: { id: 1 },
            } as unknown as LessonImageEntity

            mockImageRepository.findOne.mockResolvedValueOnce(fakeImage)
            mockLessonRepository.findOne.mockResolvedValue(null)
            setupTransaction(manager)
            manager.find.mockResolvedValue([])
            manager.save.mockResolvedValue(undefined)
            mockMediaService.deleteFile.mockResolvedValue(undefined)

            await service.remove(1, 1)

            expect(mockMediaService.deleteFile).toHaveBeenCalledWith("lessons/1/photo.jpg")
        })

        it("should reset cover before removing when image is cover", async () => {
            const manager = createTransactionManagerMock()
            const fakeImage = {
                id: 1,
                path: "lessons/1/photo.jpg",
                lesson: { id: 1 },
            } as unknown as LessonImageEntity

            const fakeLesson = {
                id: 1,
                coverImage: { id: 1 }, // изображение является обложкой
            } as unknown as LessonEntity

            mockImageRepository.findOne.mockResolvedValueOnce(fakeImage)
            mockLessonRepository.findOne.mockResolvedValue(fakeLesson)
            setupTransaction(manager)
            manager.find.mockResolvedValue([])
            manager.save.mockResolvedValue(undefined)
            mockMediaService.deleteFile.mockResolvedValue(undefined)

            await service.remove(1, 1)

            expect(manager.update).toHaveBeenCalledWith(
                LessonEntity,
                { id: 1, coverImage: { id: 1 } },
                { coverImage: null }
            )
        })

        it("should throw NotFoundException when image does not exist or belongs to another lesson", async () => {
            mockImageRepository.findOne.mockResolvedValue(null)

            await expect(service.remove(1, 99)).rejects.toThrow(NotFoundException)
        })
    })
})