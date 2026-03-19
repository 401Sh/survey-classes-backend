import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { ApplicationEntity } from "./application.entity"
import { LessonEntity } from "src/lessons/entities/lesson.entity"
import { UserChildEntity } from "src/users/entities/user-child.entity"
import { AttendanceEntity } from "src/lessons/entities/attendance.entity"
import { LessonPricingTierEntity } from "src/lessons/entities/lesson-pricing-tier.entity"
import { LessonScheduleEntity } from "src/lessons/entities/lesson-schedule.entity"
import { PaymentStatus } from "../enums/payment-status.enum"

@Entity("enrollments")
export class EnrollmentEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "datetime" })
    enrolledAt: Date

    @Column({ type: "enum", enum: EnrollmentStatus })
    status: EnrollmentStatus

    @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.UNPAID })
    paymentStatus: PaymentStatus

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToOne(() => ApplicationEntity, (application) => application.enrollment)
    @JoinColumn()
    application: ApplicationEntity

    @ManyToOne(() => LessonEntity, (lesson) => lesson.enrollments)
    lesson: LessonEntity

    @ManyToOne(() => LessonScheduleEntity, { nullable: true, onDelete: "SET NULL" })
    schedule?: LessonScheduleEntity

    @OneToMany(() => AttendanceEntity, (attendance) => attendance.enrollment)
    attendances: AttendanceEntity[]

    @ManyToOne(() => UserChildEntity, (child) => child.enrollments)
    child: UserChildEntity

    @ManyToOne(() => LessonPricingTierEntity, (tier) => tier.enrollments, {
        nullable: true,
        onDelete: "SET NULL",
    })
    pricingTier?: LessonPricingTierEntity
}