import { Report } from "@/reports/entities/report.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('report_types')
export class ReportType {
    @PrimaryGeneratedColumn('uuid')
    report_type_id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @OneToMany(() => Report, report => report.type)
    reports: Report[];

}