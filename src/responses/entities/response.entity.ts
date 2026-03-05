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
import { ResponseStatus } from "../enums/response-status.enum"
import { UserEntity } from "src/users/entities/user.entity"
import { ChildEntity } from "src/users/entities/child.entity"
import { SurveyEntity } from "src/surveys/entities/survey.entity"
import { AnswerEntity } from "./answer.entity"

@Entity("responses")
export class ResponseEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "datetime" })
    consentedAt: Date

    @Column({ type: "enum", enum: ResponseStatus, default: ResponseStatus.PENDING })
    status: ResponseStatus

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => UserEntity, (user) => user.responses)
    createdBy: UserEntity

    @ManyToOne(() => ChildEntity, (child) => child.responses)
    createdFor: ChildEntity

    @ManyToOne(() => SurveyEntity, (survey) => survey.responses)
    survey: SurveyEntity

    @OneToMany(() => AnswerEntity, (answer) => answer.response)
    answers: AnswerEntity[]
}