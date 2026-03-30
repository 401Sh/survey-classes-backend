import { BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import { SubscriptionEntity } from "./subscription.entity"

@Entity("attendances")
export class AttendanceEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "date" })
    date: Date

    @Column({ type: "bool", default: false })
    isPresent: boolean = false

    @Column({ type: "varchar", length: 500, nullable: true })
    note?: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => SubscriptionEntity, (subscription) => subscription.attendances, { onDelete: "CASCADE" })
    subscription: SubscriptionEntity
}