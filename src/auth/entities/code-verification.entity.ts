import { UserEntity } from "src/users/entities/user.entity"
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { VerificationType } from "../enums/verification-type.enum"

@Entity("code_verifications")
export class CodeVerificationEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar" })
    code: string

    @Column({ type: "enum", enum: VerificationType })
    type: VerificationType

    @Column({ type: "datetime" })
    expiresAt: Date

    @CreateDateColumn()
    createdAt: Date

    @OneToOne(() => UserEntity, (user) => user.emailVerification)
    @JoinColumn()
    user: UserEntity
}