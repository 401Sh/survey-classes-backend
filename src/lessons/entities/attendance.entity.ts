import { EnrollmentEntity } from "src/applications/entities/enrollment.entity"
import { BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import { LessonScheduleEntity } from "./lesson-schedule.entity"

@Entity("attendances")
export class AttendanceEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number
 
    @Column({ type: "bool", default: false })
    isPresent: boolean = false
 
    @Column({ type: "varchar", length: 500, nullable: true })
    note?: string
 
    @CreateDateColumn()
    createdAt: Date
 
    @UpdateDateColumn()
    updatedAt: Date
 
    @ManyToOne(() => EnrollmentEntity, (enrollment) => enrollment.attendances, { onDelete: "CASCADE" })
    enrollment: EnrollmentEntity
 
    @ManyToOne(() => LessonScheduleEntity, (schedule) => schedule.attendances, { onDelete: "CASCADE" })
    schedule: LessonScheduleEntity
}