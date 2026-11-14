import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { MediaService } from "src/media/media.service"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonImageEntity } from "../entities/lesson-image.entity"
import { LessonImageRepository } from "../abstracts/lesson-image-repository.abstract"
import { LessonRepository } from "../abstracts/lesson-repository.abstract"
import { ManageLessonImagesService } from "../services/manage-lesson-images.service"

const mockImageRepository = {
    create: vi.fn(),
    findByIdAndLessonId: vi.fn(),
    findLastByLessonId: vi.fn(),
    findAllByLessonId: vi.fn(),
    deleteAndReorder: vi.fn(),
}

const mockLessonRepository = {
    existsById: vi.fn(),
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
                { provide: LessonImageRepository, useValue: mockImageRepository },
                { provide: LessonRepository, useValue: mockLessonRepository },
                { provide: MediaService, useValue: mockMediaService },
            ],
        }).compile()

        service = module.get(ManageLessonImagesService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("uploadImage", () => {
        const fakeFile = { originalname: "photo.jpg" } as Express.Multer.File

        it("should save file to the lesson folder and create image record", async () => {
            const fakeImage = { id: 1 } as LessonImageEntity
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockImageRepository.findLastByLessonId.mockResolvedValue(null)
            mockMediaService.saveFile.mockResolvedValue("lessons/5/photo.jpg")
            mockImageRepository.create.mockResolvedValue(fakeImage)

            const result = await service.uploadImage(5, fakeFile)

            expect(result).toEqual(fakeImage)
            expect(mockMediaService.saveFile).toHaveBeenCalledWith(fakeFile, "lessons/5")
            expect(mockImageRepository.create).toHaveBeenCalledWith(5, "lessons/5/photo.jpg", 0)
        })

        it("should use position 0 when lesson has no images", async () => {
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockImageRepository.findLastByLessonId.mockResolvedValue(null)
            mockMediaService.saveFile.mockResolvedValue("path")

            await service.uploadImage(1, fakeFile)

            expect(mockImageRepository.create).toHaveBeenCalledWith(1, "path", 0)
        })

        it("should use last position + 1 when lesson already has images", async () => {
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockImageRepository.findLastByLessonId.mockResolvedValue({ id: 1, position: 2 })
            mockMediaService.saveFile.mockResolvedValue("path")

            await service.uploadImage(1, fakeFile)

            expect(mockImageRepository.create).toHaveBeenCalledWith(1, "path", 3)
        })

        it("should throw NotFoundException and not save file when lesson does not exist", async () => {
            mockLessonRepository.existsById.mockResolvedValue(false)

            await expect(service.uploadImage(99, fakeFile)).rejects.toThrow(NotFoundException)
            expect(mockMediaService.saveFile).not.toHaveBeenCalled()
        })
    })

    // -------------------------------------------------------------------------

    describe("findAll", () => {
        it("should return images of existing lesson", async () => {
            const fakeImages = [{ id: 1 }, { id: 2 }] as LessonImageEntity[]
            mockLessonRepository.existsById.mockResolvedValue(true)
            mockImageRepository.findAllByLessonId.mockResolvedValue(fakeImages)

            const result = await service.findAll(1)

            expect(result).toEqual(fakeImages)
            expect(mockImageRepository.findAllByLessonId).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when lesson does not exist", async () => {
            mockLessonRepository.existsById.mockResolvedValue(false)

            await expect(service.findAll(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("remove", () => {
        it("should delete image from database and file from storage", async () => {
            const fakeImage = { id: 3, path: "lessons/1/photo.jpg" } as LessonImageEntity
            mockImageRepository.findByIdAndLessonId.mockResolvedValue(fakeImage)

            await service.remove(1, 3)

            expect(mockImageRepository.findByIdAndLessonId).toHaveBeenCalledWith(3, 1)
            expect(mockImageRepository.deleteAndReorder).toHaveBeenCalledWith(3, 1)
            expect(mockMediaService.deleteFile).toHaveBeenCalledWith("lessons/1/photo.jpg")
        })

        it("should throw NotFoundException when image does not exist or belongs to another lesson", async () => {
            mockImageRepository.findByIdAndLessonId.mockResolvedValue(null)

            await expect(service.remove(1, 99)).rejects.toThrow(NotFoundException)
            expect(mockImageRepository.deleteAndReorder).not.toHaveBeenCalled()
            expect(mockMediaService.deleteFile).not.toHaveBeenCalled()
        })
    })
})