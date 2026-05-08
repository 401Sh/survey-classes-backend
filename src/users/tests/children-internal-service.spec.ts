import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { UserChildEntity } from "../entities/user-child.entity"
import { ChildrenInternalService } from "../services/children-internal.service"

const mockChildRepository = {
    exists: vi.fn(),
}

describe("ChildrenInternalService", () => {
    let service: ChildrenInternalService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChildrenInternalService,
                {
                    provide: getRepositoryToken(UserChildEntity),
                    useValue: mockChildRepository,
                },
            ],
        }).compile()

        service = module.get<ChildrenInternalService>(ChildrenInternalService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe("existsAndOwnedBy", () => {
        it("should return true when child exists and belongs to user", async () => {
            mockChildRepository.exists.mockResolvedValue(true)

            const result = await service.existsAndOwnedBy(1, 1)

            expect(result).toBe(true)
        })

        it("should return false when child does not exist", async () => {
            mockChildRepository.exists.mockResolvedValue(false)

            const result = await service.existsAndOwnedBy(99, 1)

            expect(result).toBe(false)
        })

        it("should return false when child belongs to another user", async () => {
            mockChildRepository.exists.mockResolvedValue(false)

            const result = await service.existsAndOwnedBy(1, 99)

            expect(result).toBe(false)
        })
    })
})