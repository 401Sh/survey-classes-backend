import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { QuestionOptionEntity } from "../entities/question-option.entity"
import { Repository } from "typeorm"

@Injectable()
export class ManageQuestionOptionsService {
    private readonly logger = new Logger(ManageQuestionOptionsService.name)

    constructor(
        @InjectRepository(QuestionOptionEntity)
        private questionOptionsRepository: Repository<QuestionOptionEntity>,
    ) {}
}