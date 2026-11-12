import { Injectable } from "@nestjs/common"
import {
    CategoryData,
    CreateCategoryData,
    DictionaryRepository,
} from "../abstracts/dictionary-repository.abstract"
import { InjectRepository } from "@nestjs/typeorm"
import { CategoryEntity } from "../entities/category.entity"
import { In, Repository } from "typeorm"

@Injectable()
export class TypeOrmDictionaryRepository implements DictionaryRepository {
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly categoryRepository: Repository<CategoryEntity>,
    ) {}

    async save(data: CreateCategoryData): Promise<CategoryEntity> {
        const category = await this.categoryRepository.save(data)

        return category
    }


    async findById(id: number): Promise<CategoryEntity | null> {
        const category = await this.categoryRepository.findOne({
            where: { id },
        })

        return category
    }


    async findAllById(ids: number[]): Promise<CategoryEntity[]> {
        const categories = await this.categoryRepository.find({
            where: { id: In(ids) },
        })

        return categories
    }


    async existsByName(name: string): Promise<boolean> {
        const isDictionaryExists = await this.categoryRepository.exists({
            where: { name: name },
        })

        return isDictionaryExists
    }


    async findAllSimplified(): Promise<CategoryEntity[]> {
        const categories = await this.categoryRepository.find({
            select: {
                id: true,
                name: true,
            },
        })

        return categories
    }



    async update(id: number, data: CategoryData): Promise<boolean> {
        const updateResult = await this.categoryRepository.update(
            { id },
            { ...data },
        )

        return (updateResult.affected && updateResult.affected > 0) ? true : false
    }


    async delete(id: number): Promise<boolean> {
        const deleteResult = await this.categoryRepository.delete({ id })

        return (deleteResult.affected && deleteResult.affected > 0) ? true : false
    }
}