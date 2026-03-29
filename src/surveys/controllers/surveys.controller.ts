import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common"
import { SurveysService } from "../services/surveys.service"
import { ApiBearerAuth, ApiOperation, ApiParam } from "@nestjs/swagger"

@Controller("surveys")
export class SurveysController {
    constructor(private surveysService: SurveysService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение опроса по ID",
    })
    @ApiParam({
        name: "surveyId",
        required: true,
        description: "ID опроса",
        example: 1,
    })
    @Get(":surveyId")
    async findById(@Param("surveyId", ParseIntPipe) surveyId: number) {
        const result = await this.surveysService.findById(surveyId)

        return result
    }
}