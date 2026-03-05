import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import { ApplicationEntity } from "./application.entity"
import { QuestionEntity } from "src/surveys/entities/question.entity"
import { QuestionOptionEntity } from "src/surveys/entities/question-option.entity"

@Entity("answers")
export class AnswerEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    // only for text question type
    @Column({ type: "text", nullable: true })
    textValue?: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => ApplicationEntity, (response) => response.answers)
    response: ApplicationEntity

    @ManyToOne(() => QuestionEntity, (question) => question.answers)
    question: QuestionEntity

    // only for radio and checkbox questions. Null for text question
    @ManyToOne(() => QuestionOptionEntity, (option) => option.answers, { nullable: true })
    selectedOption?: QuestionOptionEntity
}