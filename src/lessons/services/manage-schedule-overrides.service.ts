import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { IManageScheduleOverridesService } from "../interfaces/manage-schedule-overrides-service.interface"
import { UpdateScheduleOverrideBodyDto } from "../dto"
import { ScheduleOverrideRepository } from "../abstracts/schedule-override-repository.abstract"

@Injectable()
export class ManageScheduleOverridesService implements IManageScheduleOverridesService {
    private readonly logger = new Logger(ManageScheduleOverridesService.name)

    constructor(private readonly scheduleOverrideRepository: ScheduleOverrideRepository) {}

    async findById(id: number) {
        const scheduleOverride = await this.scheduleOverrideRepository.findById(id)

        if (!scheduleOverride) {
            this.logger.log(`No schedule override with id: ${id}`)
            throw new NotFoundException(`Schedule override with id ${id} not found`)
        }

        this.logger.log(`Finded schedule override with id: ${id}`)
        this.logger.debug("Get schedule override: ", scheduleOverride)
        return scheduleOverride
    }


    async update(overrideId: number, data: UpdateScheduleOverrideBodyDto) {
        const updateResult = await this.scheduleOverrideRepository.update(overrideId, data)

        if (!updateResult) {
            this.logger.debug(`Cannot update schedule override with id: ${overrideId}`)
            throw new NotFoundException("Schedule override not found")
        }
    
        this.logger.log(`Schedule override with id ${overrideId} updated successfully`)
    }


    async delete(overrideId: number) {
        this.logger.log(`Deleting schedule override with id: ${overrideId}`)
        const deleteResult = await this.scheduleOverrideRepository.delete(overrideId)

        if (!deleteResult) {
            this.logger.log(`Cannot delete schedule override. No schedule override with id: ${overrideId}`)
            throw new NotFoundException(`Schedule override with id ${overrideId} not found`)
        }
    }
}