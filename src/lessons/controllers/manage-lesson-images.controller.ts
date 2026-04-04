import {
    Controller,
    Delete,
    FileTypeValidator,
    Get,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    ParseIntPipe,
    Patch,
    Post,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common"
import { ManageLessonImagesService } from "../services/manage-lesson-images.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { FileInterceptor } from "@nestjs/platform-express"
import { imageMulterOptions } from "src/common/configs/multer.config"
import { MAX_FILE_SIZE } from "src/common/constants/media.constant"
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiSecurity } from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import { MEDIA_THROTTLE_LIMIT, MEDIA_THROTTLE_TTL } from "src/common/constants/throttle.constant"

// TODO: add images position reorder route
@Throttle({ default: {
    ttl: MEDIA_THROTTLE_TTL,
    limit: MEDIA_THROTTLE_LIMIT,
}})
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("lessons/:lessonId/images")
export class ManageLessonImagesController {
    constructor(private manageLessonImagesService: ManageLessonImagesService) {}

    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Загрузка изображения для занятия",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: "Файл изображения",
        schema: {
            type: "object",
            required: ["file"],
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                },
            },
        },
    })
    @Post("upload")
    @UseInterceptors(FileInterceptor("file", imageMulterOptions))
    async uploadImage(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
                    new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        const result = await this.manageLessonImagesService.uploadImage(lessonId, file)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получение всех изображений занятия",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @Get()
    async findAll(@Param("lessonId", ParseIntPipe) lessonId: number) {
        const result = await this.manageLessonImagesService.findAll(lessonId)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Обновление обложки занятия",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @ApiParam({
        name: "imageId",
        required: true,
        description: "ID изображения",
        example: 1,
    })
    @Patch(":imageId/cover")
    async setCover(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Param("imageId", ParseIntPipe) imageId: number,
    ) {
        await this.manageLessonImagesService.setCover(lessonId, imageId)

        return {
            message: "Image updated successfully",
        }
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Удаление изображения",
    })
    @ApiParam({
        name: "imageId",
        required: true,
        description: "ID изображения",
        example: 1,
    })
    @Delete(":imageId")
    async remove(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Param("imageId", ParseIntPipe) imageId: number,
    ) {
        await this.manageLessonImagesService.remove(lessonId, imageId)

        return {
            message: "Image deleted successfully"
        }
    }
}