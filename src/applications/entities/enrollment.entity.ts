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
import { AttendanceEntity } from "./attendance.entity"
import { LessonPricingTierEntity } from "src/lessons/entities/lesson-pricing-tier.entity"
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

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
    paidAmount: number = 0.0

    @Column({ type: "datetime", nullable: true })
    paidAt?: Date | null

    // copying pricingTier.sessionsCount via enrollment creation
    @Column({ type: "smallint" })
    sessionsTotal: number

    @Column({ type: "smallint" })
    sessionsLeft: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToOne(() => ApplicationEntity, (application) => application.enrollment)
    @JoinColumn()
    application: ApplicationEntity

    @ManyToOne(() => LessonEntity, (lesson) => lesson.enrollments)
    lesson: LessonEntity

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