import { TestingModule, Test } from "@nestjs/testing"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { ChildRepository } from "../abstracts/child-repository.abstract"
import { ChildrenInternalService } from "../services/children-internal.service"

const mockChildRepository = {
    existsByIdAndUserId: vi.fn(),
}

describe("ChildrenInternalService", () => {
    let service: ChildrenInternalService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChildrenInternalService,
                { provide: ChildRepository, useValue: mockChildRepository },
            ],
        }).compile()

        service = module.get(ChildrenInternalService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe("existsAndOwnedBy", () => {
        it("should return true when child exists and belongs to user", async () => {
            mockChildRepository.existsByIdAndUserId.mockResolvedValue(true)

            const result = await service.existsAndOwnedBy(1, 5)

            expect(result).toBe(true)
            expect(mockChildRepository.existsByIdAndUserId).toHaveBeenCalledWith(1, 5)
        })

        it("should return false when child does not exist or belongs to another user", async () => {
            mockChildRepository.existsByIdAndUserId.mockResolvedValue(false)

            const result = await service.existsAndOwnedBy(1, 99)

            expect(result).toBe(false)
        })
    })
})