import { InjectRepository } from "@nestjs/typeorm"
import { LessonScheduleOverrideEntity } from "../entities/lesson-schedule-override.entity"
import {
    CreateScheduleOverrideData,
    ScheduleOverrideData,
    ScheduleOverrideFilters,
    ScheduleOverrideRepository,
} from "../abstracts/schedule-override-repository.abstract"
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm"
import { SortDirection } from "src/common/enums/sort-direction.enum"
import { Injectable } from "@nestjs/common"

@Injectable()
export class TypeOrmScheduleOverrideRepository implements ScheduleOverrideRepository {
    constructor(
        @InjectRepository(LessonScheduleOverrideEntity)
        private readonly scheduleOverrideRepository: Repository<LessonScheduleOverrideEntity>,
    ) {}

    async create(lessonId: number, data: CreateScheduleOverrideData): Promise<LessonScheduleOverrideEntity> {
        const scheduleOverride = await this.scheduleOverrideRepository.save({
            ...data,
            lesson: { id: lessonId },
        })

        return scheduleOverride
    }


    async findById(id: number): Promise<LessonScheduleOverrideEntity | null> {
        const scheduleOverride = await this.scheduleOverrideRepository.findOne({
            where: { id },
        })

        return scheduleOverride
    }


    async findAllByLessonId(
        lessonId: number,
        filters: ScheduleOverrideFilters,
    ): Promise<LessonScheduleOverrideEntity[]> {
        const { dateFrom, dateTo, status } = filters

        const dateFilter = this.getDateFilter(dateFrom, dateTo)

        const scheduleOverrides = await this.scheduleOverrideRepository.find({
            where: {
                lesson: { id: lessonId },
                date: dateFilter,
                status,
            },
            order: {
                date: SortDirection.ASC,
            }
        })

        return scheduleOverrides
    }


    async findPublicByLessonId(
        lessonId: number,
        dateFrom?: Date,
        dateTo?: Date,
    ): Promise<LessonScheduleOverrideEntity[]> {
        const dateFilter = this.getDateFilter(dateFrom, dateTo)

        const scheduleOverride = await this.scheduleOverrideRepository.find({
            where: {
                lesson: {
                    id: lessonId,
                },
                date: dateFilter,
            },
            select: {
                id: true,
                date: true,
                startTime: true,
                address: true,
                status: true,
                note: true,
            },
            order: {
                date: SortDirection.ASC,
            },
        })

        return scheduleOverride
    }


    async update(id: number, data: ScheduleOverrideData): Promise<boolean> {
        const updateResult = await this.scheduleOverrideRepository.update(
            { id },
            { ...data },
        )

        return (updateResult.affected && updateResult.affected > 0) ? true : false
    }


    async delete(id: number): Promise<boolean> {
        const deleteResult = await this.scheduleOverrideRepository.delete({ id })

        return (deleteResult.affected && deleteResult.affected > 0) ? true : false
    }


    private getDateFilter(dateFrom?: Date, dateTo?: Date) {
        const dateFilter = dateFrom && dateTo
            ? Between(dateFrom, dateTo)
            : dateFrom
            ? MoreThanOrEqual(dateFrom)
            : dateTo
            ? LessThanOrEqual(dateTo)
            : undefined

        return dateFilter
    }
}