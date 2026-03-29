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
import { ApplicationStatus } from "../enums/application-status.enum"
import { SurveyEntity } from "src/surveys/entities/survey.entity"
import { AnswerEntity } from "./answer.entity"
import { EnrollmentEntity } from "./enrollment.entity"

@Entity("applications")
export class ApplicationEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "enum", enum: ApplicationStatus, default: ApplicationStatus.PENDING })
    status: ApplicationStatus

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToOne(() => EnrollmentEntity, {
        onDelete: "CASCADE",
        nullable: true,
    })
    @JoinColumn()
    enrollment: EnrollmentEntity

    @ManyToOne(() => SurveyEntity, (survey) => survey.applications, {
        onDelete: "SET NULL",
        nullable: true,
    })
    survey: SurveyEntity

    @OneToMany(() => AnswerEntity, (answer) => answer.response)
    answers: AnswerEntity[]
}