import { Image } from '@/images/entities/image.entity';
import { ReportType } from '@/reports/report-types/entities/report-type.entity';
import { User } from '@/users/entities/user.entity';
import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import {
  ALLOWED_REPORT_STATES,
  REPORT_STATES,
  ReportState,
} from '../consts/report.states';

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

  @ManyToOne(() => ReportType)
  @JoinColumn({
    referencedColumnName: 'report_type_id',
    name: 'report_type_id',
  })
  type: ReportType;

  @Exclude({ toPlainOnly: true })
  @ManyToOne(() => Image, { nullable: true })
  @JoinColumn({
    referencedColumnName: 'image_id',
    name: 'image_id',
  })
  image?: Image;

  @Expose({ name: 'image_url' })
  imageUrl() {
    return '/images/' + this.image?.image_id;
  }

  @Column({
    type: 'enum',
    enum: ALLOWED_REPORT_STATES,
    default: REPORT_STATES.OPENED,
  })
  state: ReportState;

  @ManyToOne(() => User)
  @JoinColumn({
    referencedColumnName: 'user_id',
    name: 'user_id',
  })
  user: User;

  @Column({ nullable: true, type: 'date', default: 'NOW()' })
  state_change_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
