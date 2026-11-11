import { InjectRepository } from "@nestjs/typeorm"
import {
    WeeklySlotData,
    WeeklySlotListFilters,
    WeeklySlotRepository,
} from "../abstracts/weekly-slot-repository.abstract"
import { LessonWeeklySlotEntity } from "../entities/lesson-weekly-slot.entity"
import { In, Repository } from "typeorm"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { Injectable } from "@nestjs/common"

@Injectable()
export class TypeOrmWeeklySlotRepository implements WeeklySlotRepository {
    constructor(
        @InjectRepository(LessonWeeklySlotEntity)
        private readonly weeklySlotRepository: Repository<LessonWeeklySlotEntity>
    ) {}

    async createMany(lessonId: number, data: WeeklySlotData, daysOfWeek: number[]): Promise<LessonWeeklySlotEntity[]> {
        const slots = daysOfWeek.map(dayOfWeek => ({
            ...data,
            dayOfWeek,
            lesson: { id: lessonId },
        }))

        const savedWeeklySlots = await this.weeklySlotRepository.save(slots)

        return savedWeeklySlots
    }


    async findById(id: number): Promise<LessonWeeklySlotEntity | null> {
        const weeklySlot = await this.weeklySlotRepository.findOne({
            where: { id },
        })

        return weeklySlot
    }


    async findByIdWithLesson(id: number): Promise<LessonWeeklySlotEntity | null> {
        const weeklySlot = await this.weeklySlotRepository.findOne({
            where: { id },
            relations: { lesson: true },
        })
 
        return weeklySlot
    }


    async findActiveByLessonId(lessonId: number): Promise<LessonWeeklySlotEntity[]> {
        const weeklySlots = await this.weeklySlotRepository.find({
            where: {
                lesson: {
                    id: lessonId,
                },
                isActive: true,
            },
            select: {
                id: true,
                dayOfWeek: true,
                startTime: true,
                durationMinutes: true,
                address: true,
            },
            order: {
                dayOfWeek: SortDirection.ASC,
            },
        })

        return weeklySlots
    }


    async findAllByLessonId(lessonId: number, filters: WeeklySlotListFilters): Promise<LessonWeeklySlotEntity[]> {
        const { isActive, daysOfWeek } = filters

        const weeklySlots = await this.weeklySlotRepository.find({
            where: {
                lesson: { id: lessonId },
                isActive,
                dayOfWeek: daysOfWeek ? In(daysOfWeek) : undefined,
            },
            order: {
                dayOfWeek: SortDirection.ASC,
            }
        })

        return weeklySlots
    }


    async findDuplicates(
        lessonId: number,
        daysOfWeek: number[],
        startTime: string,
    ): Promise<LessonWeeklySlotEntity[]> {
        const duplicates = await this.weeklySlotRepository.find({
            where: {
                lesson: { id: lessonId },
                dayOfWeek: In(daysOfWeek),
                startTime,
            },
        })
 
        return duplicates
    }


    async save(weeklySlot: LessonWeeklySlotEntity): Promise<LessonWeeklySlotEntity> {
        const savedWeeklySlot = await this.weeklySlotRepository.save(weeklySlot)
 
        return savedWeeklySlot
    }


    async delete(id: number): Promise<boolean> {
        const deleteResult = await this.weeklySlotRepository.delete({ id })

        return (deleteResult.affected && deleteResult.affected > 0) ? true : false
    }
}