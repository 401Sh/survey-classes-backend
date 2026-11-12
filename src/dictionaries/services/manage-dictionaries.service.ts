import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { CategoryEntity } from "../entities/category.entity"
import { IManageDictionariesService } from "../interfaces/manage-dictionaries-service.interface"
import { CreateCategoryBodyDto, UpdateCategoryBodyDto } from "../dto"
import { DictionaryRepository } from "../abstracts/dictionary-repository.abstract"

@Injectable()
export class ManageDictionariesService implements IManageDictionariesService {
    private readonly logger = new Logger(ManageDictionariesService.name)
 
    constructor(private readonly dictionaryRepository: DictionaryRepository) {}

    async createCategory(data: CreateCategoryBodyDto) {
        const { name } = data

        const isDictionaryExists = await this.dictionaryRepository.existsByName(name)

        if (isDictionaryExists) {
            throw new ConflictException(`Category "${name}" already exists`)
        }

        const category = await this.dictionaryRepository.save(data)

        this.logger.log(`Created category: ${name}`)
        return category
    }


    async findCategoriesByIds(categoryIds: number[]): Promise<CategoryEntity[]> {
        return await this.dictionaryRepository.findAllById(categoryIds)
    }


    async updateCategory(categoryId: number, data: UpdateCategoryBodyDto) {
        const { name } = data

        const category = await this.dictionaryRepository.findById(categoryId)

        if (!category) {
            throw new NotFoundException(`Category with id ${categoryId} not found`)
        }

        if (name && name !== category.name) {
            const isDictionaryExists = await this.dictionaryRepository.existsByName(name)

            if (isDictionaryExists) {
                throw new ConflictException(`Category "${name}" already exists`)
            }
        }

        const updateResult = await this.dictionaryRepository.update(categoryId, data)

        if (!updateResult) {
            this.logger.debug(`Cannot update category with id: ${categoryId}`)
            throw new NotFoundException(`category with id ${categoryId} not found`)
        }
 
        this.logger.log(`Updated category ${categoryId}`)
    }


    async deleteCategory(categoryId: number) {
        this.logger.log(`Deleting category with id: ${categoryId}`)
        const deleteResult = await this.dictionaryRepository.delete(categoryId)

        if (!deleteResult) {
            this.logger.log(`Cannot delete category. No category with id: ${categoryId}`)
            throw new NotFoundException(`Category with id ${categoryId} not found`)
        }
    }
}