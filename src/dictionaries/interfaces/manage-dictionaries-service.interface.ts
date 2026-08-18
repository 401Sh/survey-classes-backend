import { CreateCategoryBodyDto, UpdateCategoryBodyDto } from "../dto"
import { CategoryEntity } from "../entities/category.entity"

export interface IManageDictionariesService {
    createCategory(data: CreateCategoryBodyDto): Promise<CategoryEntity>
    findCategoriesByIds(categoryIds: number[]): Promise<CategoryEntity[]>
    updateCategory(categoryId: number, data: UpdateCategoryBodyDto): Promise<void>
    deleteCategory(categoryId: number): Promise<void>
}