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

    @Column({ type: "bool", default: false})
    isActive: boolean = false

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => UserEntity, (user) => user.surveys)
    createdBy: UserEntity

    @ManyToOne(() => LessonEntity, (lesson) => lesson.surveys)
    lesson: LessonEntity

    @OneToMany(() => QuestionEntity, (question) => question.survey)
    questions: QuestionEntity[]

    @OneToMany(() => ApplicationEntity, (application) => application.survey)
    applications: ApplicationEntity[]
}