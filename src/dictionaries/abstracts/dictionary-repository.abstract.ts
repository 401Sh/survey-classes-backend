import { CategoryEntity } from "../entities/category.entity"

export type CategoryData = {
    name: string,
}

export type CreateCategoryData = CategoryData

export abstract class DictionaryRepository {
    // public
    abstract findAllSimplified(): Promise<CategoryEntity[]>

    // manage
    abstract save(data: CreateCategoryData): Promise<CategoryEntity>
    abstract existsByName(name: string): Promise<boolean>
    abstract findById(id: number): Promise<CategoryEntity | null>
    abstract findAllById(ids: number[]): Promise<CategoryEntity[]>
    abstract update(id: number, data: CategoryData): Promise<boolean>
    abstract delete(id: number): Promise<boolean>
}