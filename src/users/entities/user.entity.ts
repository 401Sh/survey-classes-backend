import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
    JoinColumn
} from "typeorm"
import { ChildEntity } from "./child.entity"
import { AuthIdentityEntity } from "src/auth/entities/auth-identity.entity"
import { SurveyEntity } from "src/surveys/entities/survey.entity"
import { LessonEntity } from "src/lessons/entities/lesson.entity"
import { ResponseEntity } from "src/responses/entities/response.entity"
import { UserRole } from "../enums/user-role.enum"

@Entity("users")
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255 })
    firstName: string

    @Column({ type: "varchar", length: 255 })
    secondName: string

    @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
    role: UserRole

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToMany(() => AuthIdentityEntity, (authIdentity) => authIdentity.user)
    authIdentities: AuthIdentityEntity[]

    @OneToMany(() => ChildEntity, (child) => child.user)
    children: ChildEntity[]

    @OneToMany(() => LessonEntity, (lesson) => lesson.createdBy)
    lessons: LessonEntity[]

    @OneToMany(() => SurveyEntity, (survey) => survey.createdBy)
    surveys: SurveyEntity[]

    @OneToMany(() => ResponseEntity, (response) => response.createdBy)
    responses: ResponseEntity[]
}