import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import * as dotenv from "dotenv"
import { Logger, LogLevel, ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

dotenv.config()

const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || 3000

const logLevels = process.env.LOG_LEVEL?.split(",") as LogLevel[] || ["log", "error", "warn"]

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    )

    app.setGlobalPrefix("api/v1")
    app.useLogger(logLevels)

    const swaggerConfig = new DocumentBuilder()
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
  
    SwaggerModule.setup('api/v1/docs', app, document)

    await app.listen(port, host).then(() => {
        Logger.log(`http://${host}:${port}/api/v1 - server start`)
        Logger.log(`http://${host}:${port}/api/v1/docs - swagger start`)
    })
}
bootstrap()