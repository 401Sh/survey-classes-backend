export interface ICryptoService {
    hashData(data: string): Promise<string>
    verifyData(data: string, hashedData: string): Promise<boolean>
}