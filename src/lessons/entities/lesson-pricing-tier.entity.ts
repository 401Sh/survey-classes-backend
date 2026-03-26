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
import { ApplicationEntity } from "src/applications/entities/application.entity"
import { EnrollmentEntity } from "src/applications/entities/enrollment.entity"

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
 
    @OneToMany(() => ApplicationEntity, (application) => application.pricingTier)
    applications: ApplicationEntity[]
 
    @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.pricingTier)
    enrollments: EnrollmentEntity[]
}