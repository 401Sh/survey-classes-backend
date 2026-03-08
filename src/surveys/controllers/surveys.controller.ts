import { Controller, Get, Query } from "@nestjs/common"
import { SurveysService } from "../services/surveys.service"
import { GetSurveyByLessonQueryDto } from "../dto/get-survey-by-lesson-query.dto"
import { ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger"

@Controller("surveys")
export class SurveysController {
    constructor(private surveysService: SurveysService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение опроса к занятию",
    })
    @ApiQuery({
        name: "lessonId",
        required: true,
        description: "ID Занятия",
        example: 19,
    })
    @Get()
    async findByLessonId(@Query() query: GetSurveyByLessonQueryDto) {
        const result = await this.surveysService.findByLessonId(query)

        return result
    }
}