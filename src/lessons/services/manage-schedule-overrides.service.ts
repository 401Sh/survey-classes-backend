import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UpdateScheduleOverrideBodyDto } from "../dto/update-schedule-override-body.dto"

@Injectable()
export class ManageScheduleOverridesService {
    private readonly logger = new Logger(ManageScheduleOverridesService.name)

    constructor(
        @InjectRepository(LessonScheduleOverrideEntity)
        private scheduleOverrideRepository: Repository<LessonScheduleOverrideEntity>,
    ) {}

    async findById(id: number) {
        const scheduleOverride = await this.scheduleOverrideRepository.findOne({
            where: { id },
        })

        if (!scheduleOverride) {
            this.logger.log(`No schedule override with id: ${id}`)
            throw new NotFoundException(`Schedule override with id ${id} not found`)
        }

        this.logger.log(`Finded schedule override with id: ${id}`)
        this.logger.debug("Get schedule override: ", scheduleOverride)
        return scheduleOverride
    }


    async update(overrideId: number, data: UpdateScheduleOverrideBodyDto) {
        const updateResult = await this.scheduleOverrideRepository.update(
            { id: overrideId },
            { ...data },
        )

        if (updateResult.affected === 0) {
            this.logger.debug(`Cannot update schedule override with id: ${overrideId}`)
            throw new NotFoundException("Schedule override not found")
        }
    
        this.logger.log(`Schedule override with id ${overrideId} updated successfully`)
        return updateResult
    }


    async delete(overrideId: number) {
        this.logger.log(`Deleting schedule override with id: ${overrideId}`)
        const deleteResult = await this.scheduleOverrideRepository.delete({ id: overrideId })

        if (deleteResult.affected === 0) {
            this.logger.log(`Cannot delete schedule override. No schedule override with id: ${overrideId}`)
            throw new NotFoundException(`Schedule override with id ${overrideId} not found`)
        }

        return deleteResult
    }
}