import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CaseStatus } from '../../common/enums';
import { Participant } from './participant.entity';
import { PhysicalHealthHistory } from './physical-health-history.entity';
import { MentalHealthHistory } from './mental-health-history.entity';
import { InterventionPlan } from './intervention-plan.entity';
import { ProgressNote } from './progress-note.entity';
import { ClosingNote } from './closing-note.entity';
import { ParticipantIdentifiedSituation } from './participant-identified-situation.entity';
import { CaseFollowUpPlan } from './case-follow-up-plan.entity';
import { Weighing } from './weighing.entity';

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'case_number', type: 'varchar', length: 20, unique: true })
  caseNumber!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.OPEN,
  })
  status!: CaseStatus;

  @Column({ name: 'participant_id', type: 'int', unsigned: true })
  participantId!: number;

  @ManyToOne(() => Participant, (participant) => participant.cases)
  @JoinColumn({ name: 'participant_id' })
  participant!: Participant;

  // 2. MOTIVO DE LA CONSULTA - ahora es string simple
  @Column({ name: 'consultation_reason', type: 'text', nullable: true })
  consultationReason?: string;

  // 4. INTERVENCIÓN INICIAL - ahora es string simple
  @Column({ name: 'intervention', type: 'text', nullable: true })
  intervention?: string;

  // 5. PLAN DE SEGUIMIENTO - ahora es many-to-many con IDs
  @OneToMany(() => CaseFollowUpPlan, (cfp) => cfp.case, {
    cascade: true,
  })
  caseFollowUpPlans!: CaseFollowUpPlan[];

  // 6. HISTORIA DE SALUD FÍSICA
  @OneToOne(() => PhysicalHealthHistory, (history) => history.case, {
    cascade: true,
  })
  physicalHealthHistory!: PhysicalHealthHistory;

  // 7. HISTORIA DE SALUD MENTAL
  @OneToOne(() => MentalHealthHistory, (history) => history.case, {
    cascade: true,
  })
  mentalHealthHistory!: MentalHealthHistory;

  // 8. WEIGHING (Tabla de ponderación)
  @OneToOne(() => Weighing, (weighing) => weighing.case, {
    cascade: true,
  })
  weighing!: Weighing;

  // 9. PLANES DE INTERVENCIÓN DETALLADOS
  @OneToMany(() => InterventionPlan, (plan) => plan.case, {
    cascade: true,
  })
  interventionPlans!: InterventionPlan[];

  // 10. NOTAS DE PROGRESO
  @OneToMany(() => ProgressNote, (note) => note.case, {
    cascade: true,
  })
  progressNotes!: ProgressNote[];

  // 11. REFERIDOS - ahora es string simple
  @Column({ name: 'referrals', type: 'text', nullable: true })
  referrals?: string;

  // 12. NOTA DE CIERRE
  @OneToOne(() => ClosingNote, { cascade: true })
  @JoinColumn()
  closingNote!: ClosingNote;

  // 3. SITUACIONES IDENTIFICADAS
  @OneToMany(() => ParticipantIdentifiedSituation, (pis) => pis.case, {
    cascade: true,
  })
  participantIdentifiedSituations!: ParticipantIdentifiedSituation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
