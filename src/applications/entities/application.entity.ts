import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import { ApplicationStatus } from "../enums/application-status.enum"
import { UserEntity } from "src/users/entities/user.entity"
import { ChildEntity } from "src/users/entities/child.entity"
import { SurveyEntity } from "src/surveys/entities/survey.entity"
import { AnswerEntity } from "./answer.entity"

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

    @ManyToOne(() => UserEntity, (user) => user.applications)
    createdBy: UserEntity

    @ManyToOne(() => ChildEntity, (child) => child.applications)
    createdFor: ChildEntity

    @ManyToOne(() => SurveyEntity, (survey) => survey.applications)
    survey: SurveyEntity

    @OneToMany(() => AnswerEntity, (answer) => answer.response)
    answers: AnswerEntity[]
}