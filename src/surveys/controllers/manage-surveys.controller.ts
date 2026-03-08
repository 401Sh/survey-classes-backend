import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request } from "@nestjs/common"
import { ManageSurveysService } from "../services/manage-surveys.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { CopySurveyBodyDto } from "../dto/copy-survey-body.dto"
import { CreateSurveyBodyDto } from "../dto/create-survey-body.dto"
import { GetSurveyListQueryDto } from "../dto/get-survey-list-query.dto"
import { UpdateSurveyBodyDto } from "../dto/update-survey-body.dto"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/surveys")
export class ManageSurveysController {
    constructor(private manageSurveysService: ManageSurveysService) {}

    @Post()
    async create(
        @Request() req,
        @Body() data: CreateSurveyBodyDto,
    ) {
        const userId = req.user.sub
        const result = await this.manageSurveysService.create(userId, data)

        return result
    }


    @Post(":surveyId/copy")
    async copy(
        @Param("surveyId", ParseIntPipe) surveyId: number,
        @Body() data: CopySurveyBodyDto,
    ) {
        const result = await this.manageSurveysService.copy(surveyId, data)

        return result
    }


    @Get()
    async findAll(@Query() query: GetSurveyListQueryDto) {
        const result = await this.manageSurveysService.findAll(query)

        return result
    }


    @Get(":surveyId")
    async findById(@Param("surveyId", ParseIntPipe) surveyId: number) {
        const result = await this.manageSurveysService.findById(surveyId)

        return result
    }


    @Patch(":surveyId")
    async update(
        @Param("surveyId", ParseIntPipe) surveyId: number,
        @Body() data: UpdateSurveyBodyDto,
    ) {
        const result = await this.manageSurveysService.update(surveyId, data)

        return result
    }


    @Delete(":surveyId")
    async remove(@Param("surveyId", ParseIntPipe) surveyId: number) {
        await this.manageSurveysService.delete(surveyId)

        return {
            message: "Survey deleted successfully"
        }
    }
}