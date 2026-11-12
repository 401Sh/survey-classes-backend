import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CategoryEntity } from "src/dictionaries/entities/category.entity"
import { DictionariesService } from "./services/dictionaries.service"
import { DictionariesController } from "./controllers/dictionaries.controller"
import { ManageDictionariesService } from "./services/manage-dictionaries.service"
import { ManageDictionariesController } from "./controllers/manage-dictionaries.controller"
import { DictionaryRepository } from "./abstracts/dictionary-repository.abstract"
import { TypeOrmDictionaryRepository } from "./repositories/typeorm-dictionary.repository"

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
        ManageDictionariesService,
        {
            provide: DictionaryRepository,
            useClass: TypeOrmDictionaryRepository,
        },
    ],
    exports: [ManageDictionariesService],
})
export class DictionariesModule {}