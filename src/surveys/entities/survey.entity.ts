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
import { QuestionEntity } from "./question.entity"
import { UserEntity } from "src/users/entities/user.entity"
import { LessonEntity } from "src/lessons/entities/lesson.entity"
import { ApplicationEntity } from "src/applications/entities/application.entity"

@Entity("surveys")
export class SurveyEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255 })
    title: string

    @Column({ type: "text", nullable: true })
    description?: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
    
    @OneToOne(() => LessonEntity, (lesson) => lesson.survey, {
        onDelete: "SET NULL",
        nullable: true,
    })
    @JoinColumn()
    lesson: LessonEntity

    @ManyToOne(() => UserEntity, (user) => user.surveys)
    createdBy: UserEntity

    @OneToMany(() => QuestionEntity, (question) => question.survey, { cascade: true })
    questions: QuestionEntity[]

    @OneToMany(() => ApplicationEntity, (application) => application.survey)
    applications: ApplicationEntity[]
}