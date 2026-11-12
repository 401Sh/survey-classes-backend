import { Injectable, Logger } from "@nestjs/common"
import { CategoryEntity } from "../entities/category.entity"
import { IDictionariesService } from "../interfaces/dictionaries-service.interface"
import { DictionaryRepository } from "../abstracts/dictionary-repository.abstract"

@Injectable()
export class DictionariesService implements IDictionariesService {
    private readonly logger = new Logger(DictionariesService.name)

    constructor(private readonly dictionaryRepository: DictionaryRepository) {}


    async findAllCategories(): Promise<CategoryEntity[]> {
        const categories = await this.dictionaryRepository.findAllSimplified()

        this.logger.debug("Get category list: ", categories)
        return categories
    }
}