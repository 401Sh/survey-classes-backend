import { Module } from "@nestjs/common"
import { ApplicationsController } from "./controllers/applications.controller"
import { ApplicationsService } from "./services/applications.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApplicationEntity } from "./entities/application.entity"
import { AnswerEntity } from "./entities/answer.entity"
import { EnrollmentEntity } from "./entities/enrollment.entity"
import { ManageApplicationsService } from "./services/manage-applications.service"
import { ManageApplicationsController } from "./controllers/manage-applications.controller"
import { ManageEnrollmentsController } from "./controllers/manage-enrollments.controller"
import { ManageEnrollmentsService } from "./services/manage-enrollments.service"

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
        ManageEnrollmentsController,
    ],
    providers: [
        ApplicationsService,
        ManageApplicationsService,
        ManageEnrollmentsService,
    ],
})
export class ApplicationsModule {}