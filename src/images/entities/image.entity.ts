import { Report } from "@/reports/entities/report.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Image {
    @PrimaryGeneratedColumn('uuid')
    image_id: string;

    @Column()
    title: string;

    @Column()
    mime: string;

    @OneToMany(() => Report, report => report.image)
    report: Report

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
