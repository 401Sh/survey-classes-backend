import { EnrollmentEntity } from "src/applications/entities/enrollment.entity"
import { SurveyEntity } from "src/surveys/entities/survey.entity"
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { LessonScheduleEntity } from "./lesson-schedule.entity"
import { LessonPricingTierEntity } from "./lesson-pricing-tier.entity"
import { CategoryEntity } from "../../dictionaries/entities/category.entity"

@Entity("lessons")
export class LessonEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255 })
    name: string

    @Column({ type: "text", nullable: true })
    description?: string

    @Column({ type: "smallint"})
    capacity: number

    @Column({ type: "bool", default: false })
    isActive: boolean = false

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
    
    @OneToOne(() => SurveyEntity, (survey) => survey.lesson)
    survey: SurveyEntity

    @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.lesson)
    enrollments: EnrollmentEntity[]

    @OneToMany(() => LessonScheduleEntity, (shedule) => shedule.lesson)
    schedules: LessonScheduleEntity

    @OneToMany(() => LessonPricingTierEntity, (pricingTier) => pricingTier.lesson)
    pricingTiers: LessonPricingTierEntity

    @ManyToMany(() => CategoryEntity, (category) => category.lessons)
    @JoinTable()
    categories: CategoryEntity[]
}