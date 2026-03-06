import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm"
import { UserChildEntity } from "./user-child.entity"
import { SurveyEntity } from "src/surveys/entities/survey.entity"
import { LessonEntity } from "src/lessons/entities/lesson.entity"
import { ApplicationEntity } from "src/applications/entities/application.entity"
import { UserRole } from "../enums/user-role.enum"

@Entity("users")
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255, unique: true, nullable: false })
    email: string

    @Column({ type: "varchar", length: 255 })
    firstName: string

    @Column({ type: "varchar", length: 255 })
    secondName: string

    @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
    role: UserRole

    @Column({ type: "boolean", default: false, nullable: false })
    isEmailVerified: boolean = false

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToMany(() => UserChildEntity, (child) => child.user)
    children: UserChildEntity[]

    @OneToMany(() => LessonEntity, (lesson) => lesson.createdBy)
    lessons: LessonEntity[]

    @OneToMany(() => SurveyEntity, (survey) => survey.createdBy)
    surveys: SurveyEntity[]

    @OneToMany(() => ApplicationEntity, (application) => application.createdBy)
    applications: ApplicationEntity[]
}