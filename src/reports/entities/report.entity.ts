import { ReportType } from '@/reports/report-types/entities/report-type.entity';
import { User } from '@/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VirtualColumn,
} from 'typeorm';
import {
  ALLOWED_REPORT_STATES,
  REPORT_STATES,
  ReportState,
} from '../consts/report.states';
import { Image } from '@/images/entities/image.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  report_id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Exclude({ toPlainOnly: true })
  @ManyToOne(() => Image, { nullable: true })
  image?: Image;

  @Expose({ name: 'image_url' })
  imageUrl() {
    return  '/images/' + this.image?.image_id;
  }

  @ManyToOne(() => ReportType)
  type: ReportType;

 
  @Column({
    type: 'enum',
    enum: ALLOWED_REPORT_STATES,
    default: REPORT_STATES.OPENED,
  })
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
