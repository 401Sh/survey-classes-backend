import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request } from "@nestjs/common"
import { ManageSurveysService } from "../services/manage-surveys.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { CopySurveyBodyDto } from "../dto/copy-survey-body.dto"
import { CreateSurveyBodyDto } from "../dto/create-survey-body.dto"
import { GetSurveyListQueryDto } from "../dto/get-survey-list-query.dto"
import { UpdateSurveyBodyDto } from "../dto/update-survey-body.dto"
import { CreateQuestionBodyDto } from "../dto/create-question-body.dto"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger"
import { SortDirection } from "src/common/enums/sort-direction.enum"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/surveys")
export class ManageSurveysController {
    constructor(private manageSurveysService: ManageSurveysService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание опроса",
    })
    @ApiBody({
        description: "Данные для создания опроса",
        required: true,
        type: CreateSurveyBodyDto,
    })
    @Post()
    async create(
        @Request() req,
        @Body() data: CreateSurveyBodyDto,
    ) {
        const userId = req.user.sub
        const result = await this.manageSurveysService.create(userId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Копирование опроса по ID",
    })
    @ApiParam({
        name: "surveyId",
        required: true,
        description: "ID опроса",
        example: 1,
    })
    @ApiBody({
        description: "Данные для копирования",
        required: true,
        type: CopySurveyBodyDto,
    })
    @Post(":surveyId/copy")
    async copy(
        @Param("surveyId", ParseIntPipe) surveyId: number,
        @Body() data: CopySurveyBodyDto,
    ) {
        const result = await this.manageSurveysService.copy(surveyId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Создание вопроса для опроса",
    })
    @ApiParam({
        name: "surveyId",
        required: true,
        description: "ID опроса",
        example: 1,
    })
    @ApiBody({
        description: "Данные для создания вопроса",
        required: true,
        type: CreateQuestionBodyDto,
    })
    @Post(":surveyId/questions")
    async createQuestion(
        @Param("surveyId", ParseIntPipe) surveyId: number,
        @Body() data: CreateQuestionBodyDto,
    ) {
        const result = await this.manageSurveysService.createQuestion(surveyId, data)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех существующих опросов",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Количество опросов на странице",
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
        description: "Фильтрация опросов, созданных позднее указанной даты",
        example: "2020-12-30",
    })
    @ApiQuery({
        name: "dateTo",
        required: false,
        description: "Фильтрация опросов, созданных раньше указанной даты",
        example: "2020-12-31",
    })
    @ApiQuery({
        name: "isActive",
        required: false,
        description: "Доступен ли опрос для пользователей",
        example: false,
    })
    @ApiQuery({
        name: "sortDirection",
        required: false,
        description: "Направление сортировки. ASC - восходящая, DESC - нисходящая",
        example: SortDirection.DESC,
        default: SortDirection.ASC,
    })
    @Get()
    async findAll(@Query() query: GetSurveyListQueryDto) {
        const result = await this.manageSurveysService.findAll(query)

        return result
    }


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
        const result = await this.manageSurveysService.findById(surveyId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех вопросов для опроса",
    })
    @ApiParam({
        name: "surveyId",
        required: true,
        description: "ID опроса",
        example: 1,
    })
    @Get(":surveyId/questions")
    async findAllQuestionsBySurveyId(@Param("surveyId", ParseIntPipe) surveyId: number) {
        const result = await this.manageSurveysService.findAllQuestionsBySurveyId(surveyId)

        return result
    }


    @ApiBearerAuth()
    @ApiOperation({
        summary: "Обновление данных опроса",
    })
    @ApiParam({
        name: "surveyId",
        required: true,
        description: "ID опроса",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления опроса",
        required: true,
        type: UpdateSurveyBodyDto,
    })
    @Patch(":surveyId")
    async update(
        @Param("surveyId", ParseIntPipe) surveyId: number,
        @Body() data: UpdateSurveyBodyDto,
    ) {
        await this.manageSurveysService.update(surveyId, data)

        return {
            message: "Survey updated successfully",
        }
    }

    
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Удаление опроса",
    })
    @ApiParam({
        name: "surveyId",
        required: true,
        description: "ID опроса",
        example: 1,
    })
    @Delete(":surveyId")
    async remove(@Param("surveyId", ParseIntPipe) surveyId: number) {
        await this.manageSurveysService.delete(surveyId)

        return {
            message: "Survey deleted successfully"
        }
    }
}