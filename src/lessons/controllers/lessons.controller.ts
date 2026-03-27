import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common"
import { LessonsService } from "../services/lessons.service"
import { Public } from "src/common/decorators/public.decorator"
import { GetLessonListQueryDto } from "../dto/get-lesson-list-query.dto"
import { ApiOperation, ApiParam } from "@nestjs/swagger"

@Controller("lessons")
export class LessonsController {
    constructor(private lessonService: LessonsService) {}

    @ApiOperation({
        summary: "Получение всех существующих занятий",
    })
    @Public()
    @Get()
    async findAll(@Query() query: GetLessonListQueryDto) {
        const result = await this.lessonService.findAll(query)

        return result
    }


    @ApiOperation({
        summary: "Получение занятия по ID",
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
        summary: "Получение расписания занятий по дням недели и временных изменений расписания",
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