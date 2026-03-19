import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { CategoryEntity } from "../entities/category.entity"
import { Repository } from "typeorm"

@Injectable()
export class DictionariesService {
    private readonly logger = new Logger(DictionariesService.name)

    constructor(
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
    ) {}


    async findAllCategories(): Promise<CategoryEntity[]> {
        const categories = await this.categoryRepository.find({
            select: {
                id: true,
                name: true,
            },
        })

        this.logger.debug('Get category list: ', categories)
        return categories
    }
}