import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, it, afterEach, beforeEach, expect } from "vitest"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { ManagePricingTiersService } from "../services/manage-pricing-tiers.service"
import { getRepositoryToken } from "@nestjs/typeorm"

const mockPricingTierRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}

describe("ManagePricingTiersService", () => {
    let service: ManagePricingTiersService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ManagePricingTiersService,
                {
                    provide: getRepositoryToken(LessonPricingTierEntity),
                    useValue: mockPricingTierRepository,
                },
            ],
        }).compile()

        service = module.get<ManagePricingTiersService>(ManagePricingTiersService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe("findById", () => {
        it("should return pricing tier when it exists", async () => {
            const fakeTier = { id: 1, label: "Basic", price: 1000 } as unknown as LessonPricingTierEntity
            mockPricingTierRepository.findOne.mockResolvedValue(fakeTier)

            const result = await service.findById(1)

            expect(result).toEqual(fakeTier)
        })

        it("should throw NotFoundException when pricing tier does not exist", async () => {
            mockPricingTierRepository.findOne.mockResolvedValue(null)

            await expect(service.findById(99)).rejects.toThrow(NotFoundException)
        })
    })

    describe("update", () => {
        it("should update pricing tier successfully", async () => {
            mockPricingTierRepository.update.mockResolvedValue({ affected: 1 })

            await expect(service.update(1, { label: "Premium" })).resolves.not.toThrow()
        })

        it("should throw NotFoundException when pricing tier does not exist", async () => {
            mockPricingTierRepository.update.mockResolvedValue({ affected: 0 })

            await expect(service.update(99, { label: "Premium" })).rejects.toThrow(NotFoundException)
        })
    })

    describe("delete", () => {
        it("should delete pricing tier successfully", async () => {
            mockPricingTierRepository.delete.mockResolvedValue({ affected: 1 })

            await expect(service.delete(1)).resolves.not.toThrow()
        })

        it("should throw NotFoundException when pricing tier does not exist", async () => {
            mockPricingTierRepository.delete.mockResolvedValue({ affected: 0 })

            await expect(service.delete(99)).rejects.toThrow(NotFoundException)
        })
    })
})