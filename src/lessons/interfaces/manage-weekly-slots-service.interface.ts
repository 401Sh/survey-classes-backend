import { UpdateWeeklySlotBodyDto } from "../dto/update-weekly-slot-body.dto"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"

export interface IManageWeeklySlotsService {
    findById(id: number): Promise<LessonWeeklySlotEntity>
    update(slotId: number, data: UpdateWeeklySlotBodyDto): Promise<void>
    delete(slotId: number): Promise<void>
}