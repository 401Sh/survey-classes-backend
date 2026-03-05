import { Module } from "@nestjs/common"
import { ApplicationsController } from "./applications.controller"
import { ApplicationsService } from "./applications.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApplicationEntity } from "./entities/application.entity"
import { AnswerEntity } from "./entities/answer.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ApplicationEntity,
            AnswerEntity,
        ]),
    ],
    controllers: [ApplicationsController],
    providers: [ApplicationsService],
})
export class ApplicationsModule {}