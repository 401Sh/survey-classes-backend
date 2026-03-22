import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request } from "@nestjs/common"
import { ManageLessonsService } from "../services/manage-lessons.service"
import { UserRole } from "src/users/enums/user-role.enum"
import { CreateLessonBodyDto } from "../dto/create-lesson-body.dto"
import { GetLessonListQueryDto } from "../dto/get-lesson-list-query.dto"
import { Roles } from "src/common/decorators/role.decorator"
import { UpdateLessonBodyDto } from "../dto/update-lesson-body.dto"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/lessons")
export class ManageLessonsController {
    constructor(private manageLessonsService: ManageLessonsService) {}

    @Post()
    async create(
        @Request() req,
        @Body() data: CreateLessonBodyDto,
    ) {
        const userId = req.user.sub
        const result = await this.manageLessonsService.create(userId, data)

        return result
    }


    @Get()
    async findAll(@Query() query: GetLessonListQueryDto) {
        const result = await this.manageLessonsService.findAll(query)

        return result
    }


    @Get(":lessonId")
    async findById(@Param("lessonId", ParseIntPipe) lessonId: number) {
        const result = await this.manageLessonsService.findById(lessonId)

        return result
    }


    @Patch(":lessonId")
    async update(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Body() data: UpdateLessonBodyDto,
    ) {
        await this.manageLessonsService.update(lessonId, data)

        return {
            message: "Lesson updated successfully",
        }
    }


    @Delete(":lessonId")
    async remove(@Param("lessonId", ParseIntPipe) lessonId: number) {
        await this.manageLessonsService.delete(lessonId)

        return {
            message: "Lesson deleted successfully"
        }
    }
}