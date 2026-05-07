import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { MediaService } from "src/media/media.service"
import { Repository } from "typeorm"
import { LessonImageEntity } from "../entities/lesson-image.entity"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { LESSON_MEDIA_PATH } from "src/common/constants/media.constant"
import { LessonEntity } from "../entities/lesson.entity"
import { IManageLessonImagesService } from "../interfaces/manage-lesson-images-service.interface"

@Injectable()
export class ManageLessonImagesService implements IManageLessonImagesService {
    private readonly logger = new Logger(ManageLessonImagesService.name)

    constructor(
        @InjectRepository(LessonImageEntity)
        private readonly imageRepository: Repository<LessonImageEntity>,
        @InjectRepository(LessonEntity)
        private readonly lessonRepository: Repository<LessonEntity>,

        private readonly mediaService: MediaService,
    ) {}

    async uploadImage(lessonId: number, file: Express.Multer.File) {
        await this.validateLessonExists(lessonId)

        // find last position
        const lastImage = await this.imageRepository.findOne({
            where: {
                lesson: { id: lessonId },
            },
            order: {
                position: SortDirection.DESC,
            },
        })

        const position = lastImage ? lastImage.position + 1 : 0

        const path = await this.mediaService.saveFile(file, `${LESSON_MEDIA_PATH}/${lessonId}`)

        const image = await this.imageRepository.save({
            path,
            position,
            lesson: { id: lessonId },
        })

        this.logger.log(`Created new image for lesson Id: ${lessonId}`)
        this.logger.debug("Created new image: ", image)
        return image
    }


    async findAll(lessonId: number) {
        await this.validateLessonExists(lessonId)

        const images = await this.imageRepository.find({
            where: {
                lesson: { id: lessonId },
            },
            order: {
                position: SortDirection.ASC,
            },
        })

        return images
    }


    async setCover(lessonId: number, imageId: number) {
        const lesson = await this.lessonRepository.findOne({
            where: { id: lessonId },
            relations: { coverImage: true },
        })

        if (!lesson) throw new NotFoundException("Lesson not found")

        const image = await this.imageRepository.findOne({
            where: {
                id: imageId,
                lesson: { id: lessonId },
            },
        })

        if (!image) throw new NotFoundException("Image not found")

        await this.lessonRepository.update(
            { id: lessonId },
            {
                coverImage: { id: imageId },
            },
        )

        this.logger.log(`Lesson with id ${lessonId} covere image updated successfully`)
    }


    async remove(lessonId: number, imageId: number) {
        const image = await this.imageRepository.findOne({
            where: {
                id: imageId,
                lesson: { id: lessonId },
            },
            relations: { lesson: true },
        })

        if (!image) throw new NotFoundException('Lesson image not found')

        // remove cover
        const lesson = await this.lessonRepository.findOne({
            where: {
                id: lessonId,
                coverImage: { id: imageId },
            },
            relations: { coverImage: true },
        })

        if (lesson && lesson.coverImage) {
            lesson.coverImage = null
            await this.lessonRepository.save(lesson)
        }

        await this.imageRepository.manager.transaction(async (manager) => {
            // снимаем обложку если нужно
            await manager.update(LessonEntity,
                {
                    id: lessonId,
                    coverImage: { id: imageId },
                },
                { coverImage: null },
            )

            // delete image in storage
            await manager.remove(image)

            // reorder image recordes position
            const images = await manager.find(LessonImageEntity,
                {
                    where: {
                        lesson: { id: lessonId },
                    },
                    order: {
                        position: SortDirection.ASC,
                    },
                },
            )

            const updatedImages = images.map((img, index) => ({ ...img, position: index }))
            await manager.save(LessonImageEntity, updatedImages)
        })

        // delete image in storage
        await this.mediaService.deleteFile(image.path)
    }


    private async validateLessonExists(lessonId: number) {
        const isLessonExists = await this.lessonRepository.exists({
            where: { id: lessonId }
        })

        if (!isLessonExists) throw new NotFoundException(`Lesson with id ${lessonId} not found`)
    }
}