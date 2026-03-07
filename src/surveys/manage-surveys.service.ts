import { Injectable, Logger } from "@nestjs/common"
import { UpdateSurveyBodyDto } from "./dto/update-survey-body.dto"
import { GetSurveyListQueryDto } from "./dto/get-survey-list-query.dto"
import { CopySurveyBodyDto } from "./dto/copy-survey-body.dto"
import { CreateSurveyBodyDto } from "./dto/create-survey-body.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { SurveyEntity } from "./entities/survey.entity"
import { Repository } from "typeorm"

@Injectable()
export class ManageSurveysService {
    private readonly logger = new Logger(ManageSurveysService.name)

    constructor(
        @InjectRepository(SurveyEntity)
        private surveyRepository: Repository<SurveyEntity>
    ) {}

    create(userId: any, data: CreateSurveyBodyDto) {
        throw new Error("Method not implemented.")
    }


    copy(surveyId: number, data: CopySurveyBodyDto) {
        throw new Error("Method not implemented.")
    }


    findAll(query: GetSurveyListQueryDto) {
        throw new Error("Method not implemented.")
    }


    findById(surveyId: number) {
        throw new Error("Method not implemented.")
    }


    update(surveyId: number, data: UpdateSurveyBodyDto) {
        throw new Error("Method not implemented.")
    }


    delete(surveyId: number) {
        throw new Error("Method not implemented.")
    }
}