import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn
} from "typeorm"
import { LessonEntity } from "./lesson.entity"

@Entity("lesson-images")
@Unique(["lesson", "position"])
export class LessonImageEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 500 })
    path: string

    @Column({ type: "smallint" })
    position: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => LessonEntity, (lesson) => lesson.images, { onDelete: "CASCADE" })
    lesson: LessonEntity
}