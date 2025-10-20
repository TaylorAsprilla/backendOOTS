import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IdentifiedSituation } from '../../common/entities';

@Entity('identified_situations')
export class IdentifiedSituations {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => IdentifiedSituation, { eager: true })
  @JoinColumn({ name: 'situation_id' })
  situation: IdentifiedSituation;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
