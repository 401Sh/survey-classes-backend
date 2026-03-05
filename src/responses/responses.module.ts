import { Module } from "@nestjs/common"
import { ResponsesController } from "./responses.controller"
import { ResponsesService } from "./responses.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ResponseEntity } from "./entities/response.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ResponseEntity,
        ]),
    ],
    controllers: [ResponsesController],
    providers: [ResponsesService],
})
export class ResponsesModule {}