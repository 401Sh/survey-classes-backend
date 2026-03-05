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
import { QuestionType } from "../enums/question-type.enum"
import { SurveyEntity } from "./survey.entity"
import { QuestionOptionEntity } from "./question-option.entity"
import { AnswerEntity } from "src/applications/entities/answer.entity"

@Entity("questions")
export class QuestionEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255 })
    label: string

    @Column({ type: "text", nullable: true })
    description?: string

    @Column({ type: "enum", enum: QuestionType, default: QuestionType.TEXT})
    type: QuestionType

    @Column({ type: "smallint" })
    position: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => SurveyEntity, (survey) => survey.questions)
    survey: SurveyEntity

    @OneToMany(() => QuestionOptionEntity, (option) => option.question)
    options: QuestionOptionEntity[]

    @OneToMany(() => AnswerEntity, (answer) => answer.question)
    answers: AnswerEntity[]
}