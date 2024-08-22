import { ReportType } from "@/reports/report-types/entities/report-type.entity";
import { User } from "@/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ALLOWED_REPORT_STATES, REPORT_STATES, ReportState } from "../consts/report.states";

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    report_id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    address: string;

    @Column({ nullable: true })
    image_url?: string;

    @ManyToOne(() => ReportType)
    @JoinColumn({
        referencedColumnName: 'report_type_id',
        name: 'report_type_id'
    })
    type: ReportType;

    @Column({ type: "enum", enum: ALLOWED_REPORT_STATES, default: REPORT_STATES.OPENED })
    state: ReportState;

    @ManyToOne(() => User)
    user: User;

    @Column({ nullable: true, type: "date", default: "NOW()" })
    state_change_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
