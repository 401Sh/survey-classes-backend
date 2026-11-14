import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { PricingTierRepository } from "../abstracts/pricing-tier-repository.abstract"
import { LessonPricingTiersInternalService } from "../services/lesson-pricing-tiers-internal.service"

const mockPricingTierRepository = {
    findActiveByIdAndLessonId: vi.fn(),
}

describe("LessonPricingTiersInternalService", () => {
    let service: LessonPricingTiersInternalService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LessonPricingTiersInternalService,
                { provide: PricingTierRepository, useValue: mockPricingTierRepository },
            ],
        }).compile()

        service = module.get(LessonPricingTiersInternalService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findActiveAndLinked", () => {
        it("should return pricing tier when it is active and belongs to the lesson", async () => {
            const fakeTier = { id: 1 } as LessonPricingTierEntity
            mockPricingTierRepository.findActiveByIdAndLessonId.mockResolvedValue(fakeTier)

            const result = await service.findActiveAndLinked(1, 10)

            expect(result).toEqual(fakeTier)
            expect(mockPricingTierRepository.findActiveByIdAndLessonId).toHaveBeenCalledWith(1, 10)
        })

        it("should throw NotFoundException when pricing tier is not found", async () => {
            mockPricingTierRepository.findActiveByIdAndLessonId.mockResolvedValue(null)

            await expect(service.findActiveAndLinked(99, 10)).rejects.toThrow(NotFoundException)
        })
    })
})