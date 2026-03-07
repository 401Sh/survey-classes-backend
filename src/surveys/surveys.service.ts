import { Injectable, Logger } from "@nestjs/common"
import { GetSurveyByLessonQueryDto } from "./dto/get-survey-by-lesson-query.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { SurveyEntity } from "./entities/survey.entity"
import { Repository } from "typeorm"

@Injectable()
export class SurveysService {
    private readonly logger = new Logger(SurveysService.name)

    constructor(
        @InjectRepository(SurveyEntity)
        private surveyRepository: Repository<SurveyEntity>
    ) {}


    findByLessonId(query: GetSurveyByLessonQueryDto) {
        throw new Error("Method not implemented.")
    }
}