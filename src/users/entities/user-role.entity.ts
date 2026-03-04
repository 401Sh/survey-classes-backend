import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { UserRole } from "../enums/user-role.enum"
import { UserEntity } from "./user.entity"

@Entity("user-roles")
export class UserRoleEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
    role: UserRole

    @OneToOne(() => UserEntity, (user) => user.role)
    user: UserEntity
}