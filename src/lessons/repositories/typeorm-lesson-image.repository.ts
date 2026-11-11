import { InjectRepository } from "@nestjs/typeorm"
import { LessonImageRepository } from "../abstracts/lesson-image-repository.abstract"
import { LessonImageEntity } from "../entities/lesson-image.entity"
import { Repository } from "typeorm"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { Injectable } from "@nestjs/common"

@Injectable()
export class TypeOrmLessonImageRepository implements LessonImageRepository {
    constructor(
        @InjectRepository(LessonImageEntity)
        private readonly imageRepository: Repository<LessonImageEntity>
    ) {}

    async create(lessonId: number, path: string, position: number): Promise<LessonImageEntity> {
        const image = await this.imageRepository.save({
            path,
            position,
            lesson: { id: lessonId },
        })

        return image
    }


    async findByIdAndLessonId(id: number, lessonId: number): Promise<LessonImageEntity | null> {
        const image = await this.imageRepository.findOne({
            where: {
                id,
                lesson: { id: lessonId },
            },
        })

        return image
    }


    async findLastByLessonId(lessonId: number): Promise<LessonImageEntity | null> {
        const lastImage = await this.imageRepository.findOne({
            where: {
                lesson: { id: lessonId },
            },
            order: {
                position: SortDirection.DESC,
            },
        })

        return lastImage
    }


    async findAllByLessonId(lessonId: number): Promise<LessonImageEntity[]> {
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


    async deleteAndReorder(id: number, lessonId: number): Promise<void> {
        await this.imageRepository.manager.transaction(async (manager) => {

            // delete image DB record
            await manager.delete(LessonImageEntity, { id })

            // reorder image records position
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
    }
}