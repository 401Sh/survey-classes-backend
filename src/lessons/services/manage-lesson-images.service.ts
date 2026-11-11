import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { MediaService } from "src/media/media.service"
import { LESSON_MEDIA_PATH } from "src/common/constants/media.constant"
import { IManageLessonImagesService } from "../interfaces/manage-lesson-images-service.interface"
import { LessonImageRepository } from "../abstracts/lesson-image-repository.abstract"
import { LessonRepository } from "../abstracts/lesson-repository.abstract"

@Injectable()
export class ManageLessonImagesService implements IManageLessonImagesService {
    private readonly logger = new Logger(ManageLessonImagesService.name)

    constructor(
        private readonly imageRepository: LessonImageRepository,
        private readonly lessonRepository: LessonRepository,

        private readonly mediaService: MediaService,
    ) {}

    async uploadImage(lessonId: number, file: Express.Multer.File) {
        await this.validateLessonExists(lessonId)

        // find last position
        const lastImage = await this.imageRepository.findLastByLessonId(lessonId)

        const path = await this.mediaService.saveFile(file, `${LESSON_MEDIA_PATH}/${lessonId}`)
        
        const position = lastImage ? lastImage.position + 1 : 0

        const image = await this.imageRepository.create(lessonId, path, position)

        this.logger.log(`Created new image for lesson Id: ${lessonId}`)
        this.logger.debug("Created new image: ", image)
        return image
    }


    async findAll(lessonId: number) {
        await this.validateLessonExists(lessonId)

        const images = await this.imageRepository.findAllByLessonId(lessonId)

        return images
    }


    async remove(lessonId: number, imageId: number) {
        const image = await this.imageRepository.findByIdAndLessonId(imageId, lessonId)

        if (!image) throw new NotFoundException("Lesson image not found")

        await this.imageRepository.deleteAndReorder(imageId, lessonId)

        // delete image in storage
        await this.mediaService.deleteFile(image.path)
    }


    private async validateLessonExists(lessonId: number) {
        const isLessonExists = await this.lessonRepository.existsById(lessonId)

        if (!isLessonExists) throw new NotFoundException(`Lesson with id ${lessonId} not found`)
    }
}