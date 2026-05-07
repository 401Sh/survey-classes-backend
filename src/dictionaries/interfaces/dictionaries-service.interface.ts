import { CategoryEntity } from "../entities/category.entity"

export interface IDictionariesService {
    findAllCategories(): Promise<CategoryEntity[]>
}