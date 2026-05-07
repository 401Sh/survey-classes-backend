import { Injectable } from "@nestjs/common"
import * as argon2 from "argon2"
import { ICryptoService } from "../interfaces/crypto-service.interface"

@Injectable()
export class CryptoService implements ICryptoService {

    async hashData(data: string): Promise<string> {
        return await argon2.hash(data)
    }


    async verifyData(data: string, hashedData: string): Promise<boolean> {
        return await argon2.verify(hashedData, data)
    }
}