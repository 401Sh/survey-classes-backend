import { BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import { LessonEntity } from "../../lessons/entities/lesson.entity"

@Entity("categories")
export class CategoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    // TODO: remove length numbers from all entities
    @Column({ type: "varchar", length: 100, unique: true })
    name: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToMany(() => LessonEntity, (lesson) => lesson.categories)
    lessons: LessonEntity[]
}