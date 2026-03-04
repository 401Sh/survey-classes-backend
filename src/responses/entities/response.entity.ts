import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import { ResponseStatus } from "../enums/response-status.enum"
import { UserEntity } from "src/users/entities/user.entity"
import { ChildEntity } from "src/users/entities/children.entity"
import { SurveyEntity } from "src/surveys/entities/survey.entity"

@Entity("responses")
export class ResponseEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "timestamptz" })
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
}