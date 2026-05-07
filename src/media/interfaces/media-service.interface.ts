export interface IMediaService {
    saveFile(file: Express.Multer.File, subfolder: string): Promise<string>
    deleteFile(relativePath: string): Promise<void>
}