import { TestingModule, Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest"
import { SubscriptionEntity } from "../entities/subscription.entity"
import { SubscriptionsInternalService } from "../services/subscriptions-internal.service"

const mockSubscriptionRepository = {
    find: vi.fn(),
    save: vi.fn(),
}

describe('SubscriptionsInternalService', () => {
    let service: SubscriptionsInternalService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscriptionsInternalService,
                {
                    provide: getRepositoryToken(SubscriptionEntity),
                    useValue: mockSubscriptionRepository,
                },
            ],
        }).compile()

        service = module.get<SubscriptionsInternalService>(SubscriptionsInternalService)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // -------------------------------------------------------------------------

    describe('findAllByEnrollmentIdAndUserId', () => {
        it('should return subscriptions for given user and enrollment', async () => {
            const fakeSubscriptions = [{ id: 1 }, { id: 2 }] as unknown as SubscriptionEntity[]
            mockSubscriptionRepository.find.mockResolvedValue(fakeSubscriptions)

            const result = await service.findAllByEnrollmentIdAndUserId(1, 1)

            expect(result).toEqual(fakeSubscriptions)
        })

        it('should return empty array when no subscriptions found', async () => {
            mockSubscriptionRepository.find.mockResolvedValue([])

            const result = await service.findAllByEnrollmentIdAndUserId(1, 99)

            expect(result).toEqual([])
        })
    })

    // -------------------------------------------------------------------------

    describe('bareCreate', () => {
        it('should create and return subscription', async () => {
            const fakeSubscription = { id: 1 } as unknown as SubscriptionEntity
            mockSubscriptionRepository.save.mockResolvedValue(fakeSubscription)

            const result = await service.bareCreate(1, 2, 1000, 8)

            expect(result).toEqual(fakeSubscription)
        })

        it('should save subscription with correct sessionsTotal and sessionsLeft', async () => {
            const fakeSubscription = { id: 1 } as unknown as SubscriptionEntity
            mockSubscriptionRepository.save.mockResolvedValue(fakeSubscription)

            await service.bareCreate(1, 2, 1000, 8)

            expect(mockSubscriptionRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    sessionsTotal: 8,
                    sessionsLeft: 8,
                })
            )
        })

        it('should save subscription with correct priceSnapshot', async () => {
            const fakeSubscription = { id: 1 } as unknown as SubscriptionEntity
            mockSubscriptionRepository.save.mockResolvedValue(fakeSubscription)

            await service.bareCreate(1, 2, 1500, 8)

            expect(mockSubscriptionRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ priceSnapshot: 1500 })
            )
        })
    })
})