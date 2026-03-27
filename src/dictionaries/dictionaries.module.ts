import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CategoryEntity } from "src/dictionaries/entities/category.entity"
import { DictionariesService } from "./services/dictionaries.service"
import { DictionariesController } from "./controllers/dictionaries.controller"
import { ManageDictionariesService } from "./services/manage-dictionaries.service"
import { ManageDictionariesController } from "./controllers/manage-dictionaries.controller"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CategoryEntity,
        ]),
    ],
    controllers: [
        DictionariesController,
        ManageDictionariesController,
    ],
    providers: [
        DictionariesService,
        ManageDictionariesService
    ],
    exports: [ManageDictionariesService],
})
export class DictionariesModule {}