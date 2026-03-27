import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { LessonEntity } from "./lesson.entity"
import { DayOfWeek } from "../enums/day-of-week.enum"

@Entity("lesson-weekly-slots")
export class LessonWeeklySlotEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "smallint" })
    dayOfWeek: DayOfWeek

    @Column({ type: "time" })
    startTime: string

    @Column({ type: "smallint" })
    durationMinutes: number

    @Column({ type: "varchar", length: 500 })
    address: string

    @Column({ type: "bool", default: true })
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => LessonEntity, (lesson) => lesson.weeklySlots, { onDelete: "CASCADE" })
    lesson: LessonEntity
}