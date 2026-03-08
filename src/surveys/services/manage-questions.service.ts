import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { QuestionEntity } from "../entities/question.entity"
import { Repository } from "typeorm"

@Injectable()
export class ManageQuestionsService {
    private readonly logger = new Logger(ManageQuestionsService.name)

    constructor(
        @InjectRepository(QuestionEntity)
        private questionRepository: Repository<QuestionEntity>,
    ) {}
}