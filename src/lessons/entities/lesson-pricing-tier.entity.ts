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
import { SubscriptionEntity } from "src/applications/entities/subscription.entity"

@Entity("lesson-pricing-tiers")
export class LessonPricingTierEntity  extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 100 })
    label: string

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
    price: number = 0.0

    @Column({ type: "smallint", default: 1 })
    sessionsCount: number

    @Column({ type: "bool", default: true })
    isActive: boolean = true

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => LessonEntity, (lesson) => lesson.pricingTiers, { onDelete: "CASCADE" })
    lesson: LessonEntity

    @OneToMany(() => SubscriptionEntity, (subscription) => subscription.pricingTier)
    subscriptions: SubscriptionEntity[]
}