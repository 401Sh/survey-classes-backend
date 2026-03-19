import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CategoryEntity } from "src/dictionaries/entities/category.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CategoryEntity,
        ]),
    ],
    controllers: [],
    providers: [],
})
export class DictionariesModule {}