import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { QuestionEntity } from "./question.entity";

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

    @OneToMany(() => QuestionEntity, (question) => question.options)
    question: QuestionEntity
}