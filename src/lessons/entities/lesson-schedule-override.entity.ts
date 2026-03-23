import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { ScheduleOverrideStatus } from "../enums/schedule-override-status.enum"
import { LessonEntity } from "./lesson.entity"

@Entity("lesson-schedule-overrides")
export class LessonScheduleOverrideEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "date" })
    date: Date

    // if lesson MOVED - new time and place
    @Column({ type: "time", nullable: true })
    startTime?: string

    @Column({ type: "varchar", length: 500, nullable: true })
    address?: string

    @Column({ type: "enum", enum: ScheduleOverrideStatus })
    status: ScheduleOverrideStatus

    @Column({ type: "varchar", length: 500, nullable: true })
    note?: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => LessonEntity, (lesson) => lesson.scheduleOverrides, { onDelete: "CASCADE" })
    lesson: LessonEntity
}