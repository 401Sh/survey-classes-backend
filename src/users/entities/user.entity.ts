import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from "typeorm"
import { ChildrenEntity } from "./children.entity"
import { UserRoleEntity } from "./user-role.entity"
import { AuthIdentityEntity } from "src/auth/entities/auth-identity.entity"

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

    @OneToMany(() => AuthIdentityEntity, (authIdentity) => authIdentity.user)
    authIdentities: AuthIdentityEntity[]

    @OneToMany(() => ChildrenEntity, (children) => children.user)
    childrens: ChildrenEntity[]

    @OneToOne(() => UserRoleEntity, (role) => role.user)
    role: UserRoleEntity
}