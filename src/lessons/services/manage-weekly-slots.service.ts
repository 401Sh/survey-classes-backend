import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { IManageWeeklySlotsService } from "../interfaces/manage-weekly-slots-service.interface"
import { UpdateWeeklySlotBodyDto } from "../dto"
import { WeeklySlotRepository } from "../abstracts/weekly-slot-repository.abstract"

@Injectable()
export class ManageWeeklySlotsService implements IManageWeeklySlotsService {
    private readonly logger = new Logger(ManageWeeklySlotsService.name)

    constructor(private readonly weeklySlotRepository: WeeklySlotRepository) {}

    async findById(id: number) {
        const weeklySlot = await this.weeklySlotRepository.findById(id)

        if (!weeklySlot) {
            this.logger.log(`No weekly slot with id: ${id}`)
            throw new NotFoundException(`Weekly slot with id ${id} not found`)
        }

        this.logger.log(`Finded weekly slot with id: ${id}`)
        this.logger.debug("Get weekly slot: ", weeklySlot)
        return weeklySlot
    }


    async update(slotId: number, data: UpdateWeeklySlotBodyDto) {
        const weeklySlot = await this.weeklySlotRepository.findByIdWithLesson(slotId)

        if (!weeklySlot) {
            this.logger.log(`No weekly slot with id: ${slotId}`)
            throw new NotFoundException(`Weekly slot with id ${slotId} not found`)
        }

        // check date + time dublication
        if (data.dayOfWeek !== undefined || data.startTime !== undefined) {
            const dayOfWeek = data.dayOfWeek ?? weeklySlot.dayOfWeek
            const startTime = data.startTime ?? weeklySlot.startTime
        
            const duplicates = await this.weeklySlotRepository.findDuplicates(
                weeklySlot.lesson.id,
                [dayOfWeek],
                startTime,
            )

            const isDuplicated = duplicates.some(s => s.id !== slotId)

            if (isDuplicated) {
                throw new ConflictException(
                    `Weekly slot for day ${dayOfWeek} at ${startTime} already exists for this lesson`
                )
            }
        }
    
        Object.assign(weeklySlot, data)
        await this.weeklySlotRepository.save(weeklySlot)

        this.logger.log(`Weekly slot with id ${slotId} updated successfully`)
    }


    async delete(slotId: number) {
        this.logger.log(`Deleting weekly slot with id: ${slotId}`)
        const deleteResult = await this.weeklySlotRepository.delete(slotId)

        if (!deleteResult) {
            this.logger.log(`Cannot delete weekly slot. No weekly slot with id: ${slotId}`)
            throw new NotFoundException(`Weekly slot with id ${slotId} not found`)
        }
    }
}