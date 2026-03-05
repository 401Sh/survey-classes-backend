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
import { QuestionEntity } from "./question.entity"
import { AnswerEntity } from "src/responses/entities/answer.entity"

@Entity("question-options")
export class QuestionOptionEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255 })
    label: string

    @Column({ type: "smallint"})
    position: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => QuestionEntity, (question) => question.options)
    question: QuestionEntity

    @OneToMany(() => AnswerEntity, (answer) => answer.selectedOption)
    answers: AnswerEntity[]
}