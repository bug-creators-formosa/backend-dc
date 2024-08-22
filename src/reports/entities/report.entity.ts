import { ReportType } from "@/reports/report-types/entities/report-type.entity";
import { User } from "@/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ALLOWED_REPORT_STATES, REPORT_STATES, ReportState } from "../consts/report.states";

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    report_id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({ nullable: true })
    image_url?: string;

    @ManyToOne(() => ReportType)
    type: ReportType;

    @Column({ type: "enum", enum: ALLOWED_REPORT_STATES, default: REPORT_STATES.OPENED })
    state: ReportState;

    @ManyToOne(() => User)
    user: User;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
