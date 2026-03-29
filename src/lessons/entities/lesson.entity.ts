import { EnrollmentEntity } from "src/applications/entities/enrollment.entity"
import { SurveyEntity } from "src/surveys/entities/survey.entity"
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { LessonPricingTierEntity } from "./lesson-pricing-tier.entity"
import { CategoryEntity } from "../../dictionaries/entities/category.entity"
import { LessonImageEntity } from "./lesson-image.entity"
import { UserEntity } from "src/users/entities/user.entity"
import { LessonWeeklySlotEntity } from "./lesson-weekly-slot.entity"
import { LessonScheduleOverrideEntity } from "./lesson-schedule-override.entity"
import { EnrollmentMode } from "../enums/enrollment-mode.enum"

@Entity("lessons")
export class LessonEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255 })
    name: string

    @Column({ type: "text", nullable: true })
    description?: string

    @Column({ type: "bool", default: false })
    isActive: boolean = false

    @Column({ type: "varchar", length: 255, nullable: true })
    teacher?: string
    
    @Column({ type: "date", nullable: true })
    startsAt?: Date

    @Column({ type: "date", nullable: true })
    endsAt?: Date

    @Column({ type: "enum", enum: EnrollmentMode, default: EnrollmentMode.MANUAL })
    enrollmentMode: EnrollmentMode

    @Column({ type: "bool", default: false })
    requiresSurvey: boolean = false

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToOne(() => SurveyEntity, (survey) => survey.lesson)
    survey: SurveyEntity

    @ManyToOne(() => UserEntity, (user) => user.lessons)
    createdBy: UserEntity

    @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.lesson)
    enrollments: EnrollmentEntity[]

    @OneToMany(() => LessonPricingTierEntity, (pricingTier) => pricingTier.lesson)
    pricingTiers: LessonPricingTierEntity[]

    @OneToMany(() => LessonImageEntity, (image) => image.lesson)
    images: LessonImageEntity[]

    @OneToMany(() => LessonWeeklySlotEntity, (slot) => slot.lesson)
    weeklySlots: LessonWeeklySlotEntity[]

    @OneToMany(() => LessonScheduleOverrideEntity, (override) => override.lesson)
    scheduleOverrides: LessonScheduleOverrideEntity[]

    @ManyToMany(() => CategoryEntity, (category) => category.lessons)
    @JoinTable()
    categories: CategoryEntity[]
}