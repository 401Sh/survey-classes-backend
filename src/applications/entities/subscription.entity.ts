import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { PaymentStatus } from "../enums/payment-status.enum"
import { LessonPricingTierEntity } from "src/lessons/entities/lesson-pricing-tier.entity"
import { EnrollmentEntity } from "./enrollment.entity"
import { AttendanceEntity } from "./attendance.entity"

@Entity("subscriptions")
export class SubscriptionEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "bool", default: true })
    isActive: boolean = true

    @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.UNPAID })
    paymentStatus: PaymentStatus

    @Column({ type: "decimal", precision: 10, scale: 2 })
    priceSnapshot: number

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
    paidAmount: number = 0.0

    @Column({ type: "datetime", nullable: true })
    paidAt?: Date | null

    // copying pricingTier.sessionsCount via subscription creation
    @Column({ type: "smallint" })
    sessionsTotal: number

    @Column({ type: "smallint" })
    sessionsLeft: number

    // only for refund logic
    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    refundedAmount?: number

    @Column({ type: "datetime", nullable: true })
    refundedAt?: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => EnrollmentEntity, { onDelete: "CASCADE" })
    enrollment: EnrollmentEntity

    @ManyToOne(() => LessonPricingTierEntity, (tier) => tier.subscriptions, {
        onDelete: "SET NULL",
        nullable: true,
    })
    pricingTier?: LessonPricingTierEntity

    @OneToMany(() => AttendanceEntity, (attendance) => attendance.subscription)
    attendances: AttendanceEntity[]
}