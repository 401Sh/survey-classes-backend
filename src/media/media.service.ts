import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import * as fs from "fs/promises"
import { randomUUID } from "crypto"
import { join } from "path"
import { ConfigService } from "@nestjs/config"
import { MIME_TO_EXT } from "src/common/constants/media.constant"

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name)

    private readonly uploadRoot: string

    constructor(private readonly configService: ConfigService) {
        this.uploadRoot = join(process.cwd(), this.configService.getOrThrow("MEDIA_ROOT_PATH"))
        this.logger.log(`Media upload root: ${this.uploadRoot}`)
    }

    async saveFile(file: Express.Multer.File, subfolder: string): Promise<string> {
        const ext = MIME_TO_EXT[file.mimetype] ?? ".jpg"
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

        const isFileExists = await this.exists(absolutePath)

        if (!isFileExists) {
            this.logger.debug(`No file ${relativePath}`)
            throw new NotFoundException("File not found")
        }

        await fs.unlink(absolutePath)
    }


    private async exists(path: string): Promise<boolean> {
        const isExists = await fs.access(path, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false)
        
        return isExists
    }
}