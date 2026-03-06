import { UserEntity } from "src/users/entities/user.entity"
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity("email_verifications")
export class EmailVerificationEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar" })
    code: string

    @Column({ type: "datetime" })
    expiresAt: Date

    @CreateDateColumn()
    createdAt: Date

    @OneToOne(() => UserEntity, (user) => user.emailVerification)
    @JoinColumn()
    user: UserEntity
}