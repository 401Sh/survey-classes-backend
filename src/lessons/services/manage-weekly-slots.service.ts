import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { Repository } from "typeorm"
import { UpdateWeeklySlotBodyDto } from "../dto/update-weekly-slot-body.dto"

@Injectable()
export class ManageWeeklySlotsService {
    private readonly logger = new Logger(ManageWeeklySlotsService.name)

    constructor(
        @InjectRepository(LessonWeeklySlotEntity)
        private weeklySlotRepository: Repository<LessonWeeklySlotEntity>,
    ) {}

    async findById(id: number) {
        const weeklySlot = await this.weeklySlotRepository.findOne({
            where: { id },
        })

        if (!weeklySlot) {
            this.logger.log(`No weekly slot with id: ${id}`)
            throw new NotFoundException(`Weekly slot with id ${id} not found`)
        }

        this.logger.log(`Finded weekly slot with id: ${id}`)
        this.logger.debug("Get weekly slot: ", weeklySlot)
        return weeklySlot
    }


    async update(slotId: number, data: UpdateWeeklySlotBodyDto) {
        const weeklySlot = await this.weeklySlotRepository.findOne({
            where: { id: slotId },
            relations: { lesson: true },
        })

        if (!weeklySlot) {
            this.logger.log(`No weekly slot with id: ${slotId}`)
            throw new NotFoundException(`Weekly slot with id ${slotId} not found`)
        }

        // check date + time dublication
        if (data.dayOfWeek !== undefined || data.startTime !== undefined) {
            const dayOfWeek = data.dayOfWeek ?? weeklySlot.dayOfWeek
            const startTime = data.startTime ?? weeklySlot.startTime
        
            const duplicate = await this.weeklySlotRepository.findOne({
                where: {
                    lesson: { id: weeklySlot.lesson.id },
                    dayOfWeek,
                    startTime,
                },
            })

            if (duplicate && duplicate.id !== slotId) {
                throw new ConflictException(
                    `Weekly slot for day ${dayOfWeek} at ${startTime} already exists for this lesson`
                )
            }
        }
    
        Object.assign(weeklySlot, data)
        const updatedResult = await this.weeklySlotRepository.save(weeklySlot)

        this.logger.log(`Weekly slot with id ${slotId} updated successfully`)
        return updatedResult
    }


    async delete(slotId: number) {
        this.logger.log(`Deleting weekly slot with id: ${slotId}`)
        const deleteResult = await this.weeklySlotRepository.delete({ id: slotId })

        if (deleteResult.affected === 0) {
            this.logger.log(`Cannot delete weekly slot. No weekly slot with id: ${slotId}`)
            throw new NotFoundException(`Weekly slot with id ${slotId} not found`)
        }

        return deleteResult
    }
}