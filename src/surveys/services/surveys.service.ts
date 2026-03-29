import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { SurveyEntity } from "../entities/survey.entity"
import { Repository } from "typeorm"

@Injectable()
export class SurveysService {
    private readonly logger = new Logger(SurveysService.name)

    constructor(
        @InjectRepository(SurveyEntity)
        private surveyRepository: Repository<SurveyEntity>,
    ) {}

    async findById(id: number) {
        const survey = await this.surveyRepository.findOne({
            where: {
                isActive: true,
                id,
            },
            relations: {
                questions: {
                    options: true,
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                questions: {
                    id: true,
                    label: true,
                    description: true,
                    type: true,
                    position: true,
                    options: {
                        id: true,
                        label: true,
                        position: true,
                    },
                },
            },
        })
        
        if (!survey) {
            this.logger.log(`No survey with id: ${id}`)
            throw new NotFoundException(`Survey with id ${id} not found`)
        }
    
        this.logger.log(`Finded survey with id: ${id}`)
        return survey
    }
}