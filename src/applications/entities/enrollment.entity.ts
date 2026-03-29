import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { LessonEntity } from "src/lessons/entities/lesson.entity"
import { UserChildEntity } from "src/users/entities/user-child.entity"
import { ApplicationEntity } from "./application.entity"
import { SubscriptionEntity } from "./subscription.entity"
import { UserEntity } from "src/users/entities/user.entity"

@Entity("enrollments")
export class EnrollmentEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "datetime" })
    enrolledAt: Date

    @Column({ type: "enum", enum: EnrollmentStatus })
    status: EnrollmentStatus

    @Column({ type: "datetime" })
    consentedAt: Date

    @Column({ type: "bool", default: false })
    isConsented: boolean = false

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToOne(() => ApplicationEntity, (application) => application.enrollment)
    application?: ApplicationEntity

    @ManyToOne(() => LessonEntity, (lesson) => lesson.enrollments, { onDelete: "CASCADE" })
    lesson: LessonEntity

    @ManyToOne(() => UserEntity, (child) => child.enrollments)
    user: UserEntity

    @ManyToOne(() => UserChildEntity, (child) => child.enrollments, {
        onDelete: "SET NULL",
        nullable: true,
    })
    child: UserChildEntity

    @OneToMany(() => SubscriptionEntity, (subscription) => subscription.enrollment)
    subscriptions: SubscriptionEntity[]
}