import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DictionariesModule } from "src/dictionaries/dictionaries.module"
import { LessonsInternalService } from "./services/lessons-internal.service"
import { LessonPricingTiersInternalService } from "./services/lesson-pricing-tiers-internal.service"
import { MediaModule } from "src/media/media.module"
import { LESSON_REPOSITORY_PROVIDERS } from "./repositories"
import { LESSON_SERVICES } from "./services"
import { LESSON_CONTROLLERS } from "./controllers"
import { LESSON_ENTITIES } from "./entities"

@Module({
    imports: [
        TypeOrmModule.forFeature(LESSON_ENTITIES),
        DictionariesModule,
        MediaModule,
    ],
    controllers: LESSON_CONTROLLERS,
    providers: [
        ...LESSON_SERVICES,
        ...LESSON_REPOSITORY_PROVIDERS,
    ],
    exports: [
        LessonsInternalService,
        LessonPricingTiersInternalService,
    ],
})
export class LessonsModule {}