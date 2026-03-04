import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("childrens")
export class ChildrenEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 255 })
    firstName: string

    @Column({ type: "varchar", length: 255 })
    secondName: string

    @Column({ type: "timestamptz" })
    birthDate: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => UserEntity, (user) => user.childrens)
    user: UserEntity
}