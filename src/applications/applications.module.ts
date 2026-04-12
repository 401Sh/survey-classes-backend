import { Module } from "@nestjs/common"
import { ApplicationsController } from "./controllers/applications.controller"
import { ApplicationsService } from "./services/applications.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApplicationEntity } from "./entities/application.entity"
import { AnswerEntity } from "./entities/answer.entity"
import { ManageApplicationsService } from "./services/manage-applications.service"
import { ManageApplicationsController } from "./controllers/manage-applications.controller"
import { EnrollmentsModule } from "src/enrollments/enrollments.module"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ApplicationEntity,
            AnswerEntity,
        ]),
        EnrollmentsModule,
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