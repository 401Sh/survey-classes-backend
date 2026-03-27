import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request } from "@nestjs/common"
import { ManageLessonsService } from "../services/manage-lessons.service"
import { UserRole } from "src/users/enums/user-role.enum"
import { CreateLessonBodyDto } from "../dto/create-lesson-body.dto"
import { GetManageLessonListQueryDto } from "../dto/get-manage-lesson-list-query.dto"
import { Roles } from "src/common/decorators/role.decorator"
import { UpdateLessonBodyDto } from "../dto/update-lesson-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"
import { CreateWeeklySlotBodyDto } from "../dto/create-weekly-slot-body.dto"
import { CreateScheduleOverrideBodyDto } from "../dto/create-schedule-override-body.dto"
import { CreatePricingTierBodyDto } from "../dto/create-pricing-tier-body.dto"
import { GetPricingTierQueryDto } from "../dto/get-pricing-tier-query.dto"
import { GetWeeklySlotQueryDto } from "../dto/get-weekly-slot-query.dto"
import { GetScheduleOverrideQueryDto } from "../dto/get-schedule-override-query.dto"
import { ScheduleOverrideStatus } from "../enums/schedule-override-status.enum"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/lessons")
export class ManageLessonsController {
    constructor(private manageLessonsService: ManageLessonsService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание занятия",
    })
    @ApiBody({
        description: "Данные для создания занятия",
        required: true,
        type: CreateLessonBodyDto,
    })
    @Post()
    async create(
        @Request() req,
        @Body() data: CreateLessonBodyDto,
    ) {
        const userId = req.user.sub
        const result = await this.manageLessonsService.create(userId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание тарифа оплаты",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @ApiBody({
        description: "Данные для тарифа оплаты",
        required: true,
        type: CreatePricingTierBodyDto,
    })
    @Post(":lessonId/pricing-tiers")
    async createPricingTier(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Body() data: CreatePricingTierBodyDto,
    ) {
        const result = await this.manageLessonsService.createPricingTier(lessonId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание расписания занятия",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @ApiBody({
        description: "Данные для создания расписания занятия",
        required: true,
        type: CreateWeeklySlotBodyDto,
    })
    @Post(":lessonId/weekly-slots")
    async createWeeklySlots(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Body() data: CreateWeeklySlotBodyDto,
    ) {
        const result = await this.manageLessonsService.createWeeklySlots(lessonId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание временного изменения расписания",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @ApiBody({
        description: "Данные для создания временного изменения расписания",
        required: true,
        type: CreateScheduleOverrideBodyDto,
    })
    @Post(":lessonId/schedule-overrides")
    async createScheduleOverride(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Body() data: CreateScheduleOverrideBodyDto,
    ) {
        const result = await this.manageLessonsService.createScheduleOverride(lessonId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех существующих занятий",
    })
    @Get()
    async findAll(@Query() query: GetManageLessonListQueryDto) {
        const result = await this.manageLessonsService.findAll(query)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение занятия по ID",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @Get(":lessonId")
    async findById(@Param("lessonId", ParseIntPipe) lessonId: number) {
        const result = await this.manageLessonsService.findById(lessonId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех тарифов оплаты для занятия",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @Get(":lessonId/pricing-tiers")
    async findAllPricingTiersByLessonId(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Query() query: GetPricingTierQueryDto,
    ) {
        const result = await this.manageLessonsService.findAllPricingTiersByLessonId(lessonId, query)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех дней недели, в которые проходит занятие",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @Get(":lessonId/weekly-slots")
    async findAllWeeklySlotsByLessonId(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Query() query: GetWeeklySlotQueryDto,
    ) {
        const result = await this.manageLessonsService.findAllWeeklySlotsByLessonId(lessonId, query)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение измененных дат занятий",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @Get(":lessonId/schedule-overrides")
    async findAllScheduleOverridesByLessonId(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Query() query: GetScheduleOverrideQueryDto,
    ) {
        const result = await this.manageLessonsService.findAllScheduleOverridesByLessonId(lessonId, query)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Обновление занятия",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления занятия",
        required: true,
        type: UpdateLessonBodyDto,
    })
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


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Удаление занятия",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @Delete(":lessonId")
    async remove(@Param("lessonId", ParseIntPipe) lessonId: number) {
        await this.manageLessonsService.delete(lessonId)

        return {
            message: "Lesson deleted successfully"
        }
    }
}