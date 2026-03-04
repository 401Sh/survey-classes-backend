import { SurveyEntity } from "src/surveys/entities/survey.entity"
import { UserEntity } from "src/users/entities/user.entity"
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

@Entity("lessons")
export class LessonEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255 })
    name: string

    @Column({ type: "text", nullable: true })
    description?: string

    @Column({ type: "smallint"})
    capacity: number

    @Column({ type: "bool", default: false })
    isActive: boolean = false

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => UserEntity, (user) => user.lessons)
    createdBy: UserEntity

    @OneToMany(() => SurveyEntity, (survey) => survey.lesson)
    surveys: SurveyEntity[]
}