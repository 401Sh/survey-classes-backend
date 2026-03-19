import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import { LessonEntity } from "./lesson.entity"

@Entity("lesson-images")
export class LessonImageEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar", length: 500 })
    url: string

    @Column({ type: "smallint" })
    position: number

    @Column({ type: "bool", default: false })
    isCover: boolean = false

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => LessonEntity, (lesson) => lesson.images, { onDelete: "CASCADE" })
    lesson: LessonEntity
}