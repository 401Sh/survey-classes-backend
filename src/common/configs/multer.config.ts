import { memoryStorage } from "multer"
import { MAX_FILE_SIZE } from "../constants/media.constant"

export const imageMulterOptions = {
    storage: memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
}