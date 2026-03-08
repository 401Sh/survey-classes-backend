import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"
import { UserEntity } from "./user.entity"
import { ApplicationEntity } from "src/applications/entities/application.entity"
import { EnrollmentEntity } from "src/applications/entities/enrollment.entity"

@Entity("children")
export class UserChildEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255 })
    firstName: string

    @Column({ type: "varchar", length: 255 })
    secondName: string

    @Column({ type: "datetime" })
    birthDate: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => UserEntity, (user) => user.children)
    user: UserEntity

    @OneToMany(() => ApplicationEntity, (application) => application.createdFor)
    applications: ApplicationEntity[]

    @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.lesson)
    enrollments: EnrollmentEntity[]
}