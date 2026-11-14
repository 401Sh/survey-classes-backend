import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { PricingTierRepository } from "../abstracts/pricing-tier-repository.abstract"
import { ManagePricingTiersService } from "../services/manage-pricing-tiers.service"

const mockPricingTierRepository = {
    findById: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
}

describe("ManagePricingTiersService", () => {
    let service: ManagePricingTiersService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManagePricingTiersService,
                { provide: PricingTierRepository, useValue: mockPricingTierRepository },
            ],
        }).compile()

        service = module.get(ManagePricingTiersService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("findById", () => {
        it("should return pricing tier when it exists", async () => {
            const fakeTier = { id: 1 } as LessonPricingTierEntity
            mockPricingTierRepository.findById.mockResolvedValue(fakeTier)

            const result = await service.findById(1)

            expect(result).toEqual(fakeTier)
            expect(mockPricingTierRepository.findById).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when pricing tier does not exist", async () => {
            mockPricingTierRepository.findById.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("update", () => {
        it("should update pricing tier with given data", async () => {
            mockPricingTierRepository.update.mockResolvedValue(true)

            await service.update(1, { price: 500 })

            expect(mockPricingTierRepository.update).toHaveBeenCalledWith(1, { price: 500 })
        })

        it("should throw NotFoundException when pricing tier does not exist", async () => {
            mockPricingTierRepository.update.mockResolvedValue(false)

            await expect(service.update(99, { price: 500 })).rejects.toThrow(NotFoundException)
        })
    })

    // -------------------------------------------------------------------------

    describe("delete", () => {
        it("should delete pricing tier", async () => {
            mockPricingTierRepository.softDelete.mockResolvedValue(true)

            await service.delete(1)

            expect(mockPricingTierRepository.softDelete).toHaveBeenCalledWith(1)
        })

        it("should throw NotFoundException when pricing tier does not exist", async () => {
            mockPricingTierRepository.softDelete.mockResolvedValue(false)

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})