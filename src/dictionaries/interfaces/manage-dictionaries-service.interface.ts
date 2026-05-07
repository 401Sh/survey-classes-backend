import { CreateCategoryBodyDto } from "../dto/create-category-body.dto"
import { UpdateCategoryBodyDto } from "../dto/update-category-body.dto"
import { CategoryEntity } from "../entities/category.entity"

export interface IManageDictionariesService {
    createCategory(data: CreateCategoryBodyDto): Promise<CategoryEntity>
    findCategoriesByIds(categoryIds: number[]): Promise<CategoryEntity[]>
    updateCategory(categoryId: number, data: UpdateCategoryBodyDto): Promise<void>
    deleteCategory(categoryId: number): Promise<void>
}