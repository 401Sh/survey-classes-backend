import { Injectable } from "@nestjs/common"
import {
    CreatePricingTierData,
    PricingTierData,
    PricingTierRepository,
} from "../abstracts/pricing-tier-repository.abstract"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

@Injectable()
export class TypeOrmPricingTierRepository implements PricingTierRepository {
    constructor(
        @InjectRepository(LessonPricingTierEntity)
        private readonly pricingTierRepository: Repository<LessonPricingTierEntity>,
    ) {}

    async create(lessonId: number, data: CreatePricingTierData): Promise<LessonPricingTierEntity> {
        const pricingTier = await this.pricingTierRepository.save({
            ...data,
            lesson: { id: lessonId },
        })

        return pricingTier
    }


    async findActiveByIdAndLessonId(id: number, lessonId: number): Promise<LessonPricingTierEntity | null> {
        const pricingTier = await this.pricingTierRepository.findOne({
            where: {
                id,
                isActive: true,
                lesson: { id: lessonId },
            },
            select: {
                id: true,
                label: true,
                price: true,
                sessionsCount: true,
                isActive: true,
            },
        })

        return pricingTier
    }


    async findAllByLessonId(lessonId: number, isActive?: boolean): Promise<LessonPricingTierEntity[]> {
        const pricingTiers = await this.pricingTierRepository.find({
            where: {
                lesson: { id: lessonId },
                isActive,
            },
        })

        return pricingTiers
    }


    async findById(id: number): Promise<LessonPricingTierEntity | null> {
        const pricingTier = await this.pricingTierRepository.findOne({
            where: { id },
            select: {
                id: true,
                label: true,
                price: true,
                sessionsCount: true,
                isActive: true,
            },
        })

        return pricingTier
    }


    async findActiveByLessonId(lessonId: number): Promise<LessonPricingTierEntity[]> {
        const pricingTiers = await this.pricingTierRepository.find({
            where: {
                lesson: {
                    id: lessonId,
                },
                isActive: true,
            },
            select: {
                id: true,
                label: true,
                price: true,
                sessionsCount: true,
            },
        })

        return pricingTiers
    }


    async update(id: number, data: PricingTierData): Promise<boolean> {
        const updateResult = await this.pricingTierRepository.update(
            { id },
            { ...data },
        )

        return (updateResult.affected && updateResult.affected > 0) ? true : false
    }


    async softDelete(id: number): Promise<boolean> {
        const deleteResult = await this.pricingTierRepository.softDelete({ id })

        return (deleteResult.affected && deleteResult.affected > 0) ? true : false
    }
}