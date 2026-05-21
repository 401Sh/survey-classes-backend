import { Injectable, InternalServerErrorException, Logger, NotFoundException, UnsupportedMediaTypeException } from "@nestjs/common"
import * as fs from "fs/promises"
import { randomUUID } from "crypto"
import { join } from "path"
import { ConfigService } from "@nestjs/config"
import { MIME_TO_EXT } from "src/common/constants/media.constant"
import { IMediaService } from "./interfaces/media-service.interface"

@Injectable()
export class MediaService implements IMediaService {
    private readonly logger = new Logger(MediaService.name)

    private readonly uploadRoot: string

    constructor(private readonly configService: ConfigService) {
        this.uploadRoot = join(process.cwd(), this.configService.getOrThrow("MEDIA_ROOT_PATH"))
        this.logger.log(`Media upload root: ${this.uploadRoot}`)
    }

    async saveFile(file: Express.Multer.File, subfolder: string): Promise<string> {
        const ext = MIME_TO_EXT[file.mimetype]
        if (!ext) {
            this.logger.error(`Unsupported mime type: ${file.mimetype}`)
            throw new UnsupportedMediaTypeException(`Unsupported mime type: ${file.mimetype}`)
        }

        const filename = randomUUID() + ext

        const absoluteDir = join(this.uploadRoot, subfolder)

        const isDirExists = await this.exists(absoluteDir)

        if (!isDirExists) {
            this.logger.debug(`Creating dir ${absoluteDir}`)
            await fs.mkdir(absoluteDir, { recursive: true })
        }

        const absolutePath = join(absoluteDir, filename)

        await fs.writeFile(absolutePath, file.buffer)

        const fullPath = `${subfolder}/${filename}`
        return fullPath
    }


    async deleteFile(relativePath: string): Promise<void> {
        const absolutePath = join(this.uploadRoot, relativePath)

        try {
            await fs.unlink(absolutePath)
        } catch (error) {
            if (error.code === "ENOENT") {
                this.logger.warn(`File not found: ${relativePath}`)
                throw new NotFoundException("File not found")
            }
            this.logger.error(`Failed to delete file ${relativePath}: ${error.message}`)
            throw new InternalServerErrorException("Failed to delete file")
        }
    }


    private async exists(path: string): Promise<boolean> {
        const isExists = await fs.access(path, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false)
        
        return isExists
    }
}