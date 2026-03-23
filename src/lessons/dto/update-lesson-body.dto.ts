import { PartialType } from "@nestjs/swagger"
import { CreateLessonBodyDto } from "./create-lesson-body.dto"

export class UpdateLessonBodyDto extends PartialType(CreateLessonBodyDto) {}