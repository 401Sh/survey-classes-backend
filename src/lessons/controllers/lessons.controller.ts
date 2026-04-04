import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common"
import { LessonsService } from "../services/lessons.service"
import { Public } from "src/common/decorators/public.decorator"
import { GetLessonListQueryDto } from "../dto/get-lesson-list-query.dto"
import { ApiOperation, ApiParam, ApiSecurity } from "@nestjs/swagger"
import { GetScheduleOverrideQueryDto } from "../dto/get-schedule-override-query.dto"

@Controller("lessons")
export class LessonsController {
    constructor(private lessonService: LessonsService) {}

    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получение всех существующих занятий",
    })
    @Public()
    @Get()
    async findAll(@Query() query: GetLessonListQueryDto) {
        const result = await this.lessonService.findAll(query)

        return result
    }


    @ApiSecurity("api-key")
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


    @ApiSecurity("api-key")
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
    async findSchedulesByLessonId(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Query() query: GetScheduleOverrideQueryDto,
    ) {
        const result = await this.lessonService.findSchedulesByLessonId(lessonId, query)

        return result
    }


    @ApiSecurity("api-key")
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