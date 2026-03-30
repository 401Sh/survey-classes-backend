import { Module } from "@nestjs/common"
import { ApplicationsController } from "./controllers/applications.controller"
import { ApplicationsService } from "./services/applications.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApplicationEntity } from "./entities/application.entity"
import { AnswerEntity } from "./entities/answer.entity"
import { ManageApplicationsService } from "./services/manage-applications.service"
import { ManageApplicationsController } from "./controllers/manage-applications.controller"
import { QuestionEntity } from "src/surveys/entities/question.entity"
import { EnrollmentEntity } from "src/enrollments/entities/enrollment.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ApplicationEntity,
            AnswerEntity,
            QuestionEntity,
            EnrollmentEntity,
        ]),
    ],
    controllers: [
        ApplicationsController,
        ManageApplicationsController,
    ],
    providers: [
        ApplicationsService,
        ManageApplicationsService,
    ],
})
export class ApplicationsModule {}