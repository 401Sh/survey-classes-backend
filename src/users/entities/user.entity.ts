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
import { UserRoleEntity } from "./user-role.entity"
import { AuthIdentityEntity } from "src/auth/entities/auth-identity.entity"
import { SurveyEntity } from "src/surveys/entities/survey.entity"
import { LessonEntity } from "src/lessons/entities/lesson.entity"
import { ResponseEntity } from "src/responses/entities/response.entity"

@Entity("users")
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255 })
    firstName: string

    @Column({ type: "varchar", length: 255 })
    secondName: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToOne(() => UserRoleEntity, (role) => role.user)
    @JoinColumn()
    role: UserRoleEntity

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