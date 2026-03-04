import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import * as dotenv from "dotenv"
import { Logger, LogLevel } from "@nestjs/common"

dotenv.config()

const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || 3000

const logLevels = process.env.LOG_LEVEL?.split(",") as LogLevel[] || ["log", "error", "warn"]

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix("api/v1")
  app.useLogger(logLevels)
  
  await app.listen(port, host).then(() => {
    Logger.log(`http://${host}:${port}/api/v1 - server start`)
  })
}
bootstrap()