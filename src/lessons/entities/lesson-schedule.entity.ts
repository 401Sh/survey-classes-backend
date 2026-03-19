import { BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { LessonEntity } from "./lesson.entity"
import { AttendanceEntity } from "./attendance.entity"

@Entity("lesson-schedules")
export class LessonScheduleEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "date" })
    date: Date

    @Column({ type: "time" })
    startTime: string

    @Column({ type: "smallint" })
    durationMinutes: number

    @Column({ type: "varchar", length: 500 })
    address: string
    
    // overrides Lesson's capacity for a specific date
    // if null, Lesson.capacity will be used
    @Column({ type: "smallint", nullable: true })
    capacity?: number

    @Column({ type: "bool", default: false })
    isCancelled: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => LessonEntity, (lesson) => lesson.schedules, { onDelete: "CASCADE" })
    lesson: LessonEntity

    @OneToMany(() => AttendanceEntity, (attendance) => attendance.schedule)
    attendances: AttendanceEntity[]
}