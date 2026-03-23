import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request } from "@nestjs/common"
import { ManageLessonsService } from "../services/manage-lessons.service"
import { UserRole } from "src/users/enums/user-role.enum"
import { CreateLessonBodyDto } from "../dto/create-lesson-body.dto"
import { GetManageLessonListQueryDto } from "../dto/get-manage-lesson-list-query.dto"
import { Roles } from "src/common/decorators/role.decorator"
import { UpdateLessonBodyDto } from "../dto/update-lesson-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { CreateWeeklySlotBodyDto } from "../dto/create-weekly-slot-body.dto"
import { CreateScheduleOverrideBodyDto } from "../dto/create-schedule-override-body.dto"
import { CreatePricingTierBodyDto } from "../dto/create-pricing-tier-body.dto"

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
    @ApiBody({
        description: "Данные для создания расписания занятия",
        required: true,
        type: CreateWeeklySlotBodyDto,
    })
    @Post(":lessonId/weekly-slots")
    async createWeeklySlot(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Body() data: CreateWeeklySlotBodyDto,
    ) {
        const result = await this.manageLessonsService.createWeeklySlot(lessonId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание временного изменения расписания",
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
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Количество занятий на странице",
        example: 10,
        default: 4,
    })
    @ApiQuery({
        name: "page",
        required: false,
        description: "Номер страницы",
        example: 2,
        default: 1,
    })
    @ApiQuery({
        name: "dateFrom",
        required: false,
        description: "Фильтрация занятий, созданных позднее указанной даты",
        example: "2020-12-30",
    })
    @ApiQuery({
        name: "dateTo",
        required: false,
        description: "Фильтрация занятий, созданных раньше указанной даты",
        example: "2020-12-31",
    })
    @ApiQuery({
        name: "categoryId",
        required: false,
        description: "ID категории",
        example: 10,
        default: 4,
    })
    @ApiQuery({
        name: "search",
        required: false,
        description: "Текст для поиска по названию или описанию",
        example: "some lesson",
    })
    @ApiQuery({
        name: "priceFrom",
        required: false,
        description: "Минимальная цена занятия",
        example: 100,
    })
    @ApiQuery({
        name: "priceTo",
        required: false,
        description: "Макисмальная цена занятия",
        example: 200,
    })
    @ApiQuery({
        name: "isActive",
        required: false,
        description: "Доступно ли занятие пользователям",
        example: true,
    })
    @ApiQuery({
        name: "sortDirection",
        required: false,
        description: "Направление сортировки. ASC - восходящая, DESC - нисходящая",
        example: SortDirection.DESC,
        default: SortDirection.ASC,
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