import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common"
import { LessonsService } from "./lessons.service"
import { Public } from "src/common/decorators/public.decorator"
import { GetLessonListQueryDto } from "./dto/get-lesson-list-query.dto"
import { ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { ScheduleStatus } from "./enums/schedule-status.enum"

@Controller("lessons")
export class LessonsController {
    constructor(private lessonService: LessonsService) {}

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
        name: "scheduleStatus",
        required: false,
        description: "Поиск по состоянию занятий. upcoming - не начавшиеся, ongoing - уже идущие",
        example: ScheduleStatus.UPCOMING,
    })
    @ApiQuery({
        name: "sortDirection",
        required: false,
        description: "Направление сортировки. ASC - восходящая, DESC - нисходящая",
        example: SortDirection.DESC,
        default: SortDirection.ASC,
    })
    @Public()
    @Get()
    async findAll(@Query() query: GetLessonListQueryDto) {
        const result = await this.lessonService.findAll(query)

        return result
    }


    @ApiOperation({
        summary: "Получение всех существующих записей на занятия",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @Public()
    @Get(":lessonId")
    async findById(@Param("lessonId", ParseIntPipe) lessonId: number) {
        const result = await this.lessonService.findById(lessonId)

        return result
    }


    @ApiOperation({
        summary: "Получение всех не отмененных дат занятий",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @Public()
    @Get(":lessonId/schedules")
    async findSchedulesByLessonId(@Param("lessonId", ParseIntPipe) lessonId: number) {
        const result = await this.lessonService.findSchedulesByLessonId(lessonId)

        return result
    }


    @ApiOperation({
        summary: "Получение всех цен занятий",
    })
    @ApiParam({
        name: "lessonId",
        required: true,
        description: "ID занятия",
        example: 1,
    })
    @Public()
    @Get(":lessonId/pricing-tiers")
    async findPricingTiersByLessonId(@Param("lessonId", ParseIntPipe) lessonId: number) {
        const result = await this.lessonService.findPricingTiersByLessonId(lessonId)

        return result
    }
}