import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { EnrollmentStatus } from "../enums/enrollment-status.enum"
import { ApplicationEntity } from "./application.entity"
import { LessonEntity } from "src/lessons/entities/lesson.entity"
import { UserChildEntity } from "src/users/entities/user-child.entity"

@Entity("enrollments")
export class EnrollmentEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "datetime" })
    enrolledAt: Date

    @Column({ type: "enum", enum: EnrollmentStatus })
    status: EnrollmentStatus

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @OneToOne(() => ApplicationEntity, (application) => application.enrollment)
    @JoinColumn()
    application: ApplicationEntity

    @ManyToOne(() => LessonEntity, (lesson) => lesson.enrollments)
    lesson: LessonEntity

    @ManyToOne(() => UserChildEntity, (child) => child.enrollments)
    child: UserChildEntity
}