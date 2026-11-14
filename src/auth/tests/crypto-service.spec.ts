import { describe, it, expect } from "vitest"
import { CryptoService } from "../services/crypto.service"

describe("CryptoService", () => {
    const service = new CryptoService()

    describe("hashData", () => {
        it("should return hash that differs from the original data", async () => {
            const hash = await service.hashData("my-password")

            expect(hash).not.toBe("my-password")
        })

        it("should return different hashes for the same data", async () => {
            const hash1 = await service.hashData("my-password")
            const hash2 = await service.hashData("my-password")

            expect(hash1).not.toBe(hash2) // у каждого хеша своя «соль»
        })
    })

    describe("verifyData", () => {
        it("should return true for correct data", async () => {
            const hash = await service.hashData("my-password")

            const result = await service.verifyData("my-password", hash)

            expect(result).toBe(true)
        })

        it("should return false for incorrect data", async () => {
            const hash = await service.hashData("my-password")

            const result = await service.verifyData("wrong-password", hash)

            expect(result).toBe(false)
        })
    })
})
