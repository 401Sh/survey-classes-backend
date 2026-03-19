import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { CategoryEntity } from "../entities/category.entity"
import { Repository } from "typeorm"
import { UpdateCategoryBodyDto } from "../dto/update-category-body.dto"
import { CreateCategoryBodyDto } from "../dto/create-category-body.dto"

@Injectable()
export class ManageDictionariesService {
    private readonly logger = new Logger(ManageDictionariesService.name)
 
    constructor(
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
    ) {}

    async createCategory(data: CreateCategoryBodyDto) {
        const { name } = data

        const existing = await this.categoryRepository.findOne({
            where: { name: name },
        })

        if (existing) {
            throw new ConflictException(`Category "${name}" already exists`)
        }

        const category = await this.categoryRepository.save(data)

        this.logger.log(`Created category: ${name}`)
        return category
    }


    async updateCategory(categoryId: number, data: UpdateCategoryBodyDto) {
        const { name } = data

        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
        })

        if (!category) {
            throw new NotFoundException(`Category with id ${categoryId} not found`)
        }

        if (name && name !== category.name) {
            const existing = await this.categoryRepository.findOne({
                where: { name: data.name },
            })

            if (existing) {
                throw new ConflictException(`Category "${name}" already exists`)
            }
        }

        const updateResult = await this.categoryRepository.update({ id: categoryId }, data)
 
        this.logger.log(`Updated category ${categoryId}`)
        return updateResult
    }


    async deleteCategory(categoryId: number) {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
        })
 
        if (!category) {
            throw new NotFoundException("Category not found")
        }
 
        await this.categoryRepository.remove(category)
 
        this.logger.log(`Deleted category ${categoryId}`)

        this.logger.log(`Deleting category with id: ${categoryId}`)
        const deleteResult = await this.categoryRepository.delete({ id: categoryId })

        if (deleteResult.affected === 0) {
            this.logger.log(`Cannot delete category. No category with id: ${categoryId}`)
            throw new NotFoundException(`Category with id ${categoryId} not found`)
        }

        return deleteResult
    }
}