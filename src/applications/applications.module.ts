import { Module } from "@nestjs/common"
import { ApplicationsController } from "./controllers/applications.controller"
import { ApplicationsService } from "./services/applications.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApplicationEntity } from "./entities/application.entity"
import { AnswerEntity } from "./entities/answer.entity"
import { EnrollmentEntity } from "./entities/enrollment.entity"
import { ManageApplicationsService } from "./services/manage-applications.service"
import { ManageApplicationsController } from "./controllers/manage-applications.controller"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ApplicationEntity,
            AnswerEntity,
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