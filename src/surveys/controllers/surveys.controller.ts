import { Controller, Get, Query } from "@nestjs/common"
import { SurveysService } from "../services/surveys.service"
import { GetSurveyByLessonQueryDto } from "../dto/get-survey-by-lesson-query.dto"

@Controller("surveys")
export class SurveysController {
    constructor(private surveysService: SurveysService) {}

    @Get()
    async findByLessonId(@Query() query: GetSurveyByLessonQueryDto) {
        const result = await this.surveysService.findByLessonId(query)

        return result
    }
}