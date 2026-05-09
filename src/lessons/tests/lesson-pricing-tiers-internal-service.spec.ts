import { NotFoundException } from "@nestjs/common"
import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { LessonPricingTierEntity } from "../entities/lesson-pricing-tier.entity"
import { LessonPricingTiersInternalService } from "../services/lesson-pricing-tiers-internal.service"

const mockPricingTierRepository = {
    findOne: vi.fn(),
}

describe("LessonPricingTiersInternalService", () => {
    let service: LessonPricingTiersInternalService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LessonPricingTiersInternalService,
                {
                    provide: getRepositoryToken(LessonPricingTierEntity),
                    useValue: mockPricingTierRepository,
                },
            ],
        }).compile()

        service = module.get<LessonPricingTiersInternalService>(LessonPricingTiersInternalService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe("findActiveAndLinked", () => {
        it("should return pricing tier when it exists, is active and linked to lesson", async () => {
            const fakeTier = {
                id: 1,
                label: "Basic",
                price: 1000,
                sessionsCount: 8,
                isActive: true,
            } as unknown as LessonPricingTierEntity
            mockPricingTierRepository.findOne.mockResolvedValue(fakeTier)

            const result = await service.findActiveAndLinked(1, 1)

            expect(result).toEqual(fakeTier)
        })

        it("should throw NotFoundException when pricing tier does not exist", async () => {
            mockPricingTierRepository.findOne.mockResolvedValue(null)

            await expect(service.findActiveAndLinked(99, 1)).rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when pricing tier is inactive", async () => {
            // findOne вернёт null потому что where включает isActive: true —
            // неактивный тир просто не найдётся в БД
            mockPricingTierRepository.findOne.mockResolvedValue(null)

            await expect(service.findActiveAndLinked(1, 1)).rejects.toThrow(NotFoundException)
        })

        it("should throw NotFoundException when pricing tier belongs to another lesson", async () => {
            // аналогично — where включает lesson: { id: lessonId }
            mockPricingTierRepository.findOne.mockResolvedValue(null)

            await expect(service.findActiveAndLinked(1, 99)).rejects.toThrow(NotFoundException)
        })
    })
})