import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { ApplicationStatus } from "../enums/application-status.enum"
import { UserEntity } from "src/users/entities/user.entity"
import { UserChildEntity } from "src/users/entities/user-child.entity"
import { SurveyEntity } from "src/surveys/entities/survey.entity"
import { AnswerEntity } from "./answer.entity"
import { EnrollmentEntity } from "./enrollment.entity"
import { LessonPricingTierEntity } from "src/lessons/entities/lesson-pricing-tier.entity"

@Entity("applications")
export class ApplicationEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "datetime" })
    consentedAt: Date

    @Column({ type: "enum", enum: ApplicationStatus, default: ApplicationStatus.PENDING })
    status: ApplicationStatus

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToOne(() => EnrollmentEntity, (enrollment) => enrollment.application)
    enrollment: EnrollmentEntity

    @ManyToOne(() => UserEntity, (user) => user.applications)
    createdBy: UserEntity

    @ManyToOne(() => UserChildEntity, (child) => child.applications)
    createdFor: UserChildEntity

    @ManyToOne(() => SurveyEntity, (survey) => survey.applications, {
        onDelete: "SET NULL",
        nullable: true,
    })
    survey: SurveyEntity

    @ManyToOne(() => LessonPricingTierEntity, (pricingTier) => pricingTier.applications)
    pricingTier: LessonPricingTierEntity

    @OneToMany(() => AnswerEntity, (answer) => answer.response)
    answers: AnswerEntity[]
}