import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import {
  DocumentType,
  Gender,
  MaritalStatus,
  HealthInsurance,
  EmergencyContactRelationship,
} from '../../common/entities';
import { User } from '../../users/entities/user.entity';
import { FamilyMember } from './family-member.entity';
import { BioPsychosocialHistory } from './bio-psychosocial-history.entity';
import { ConsultationReason } from './consultation-reason.entity';
import { IdentifiedSituations } from './identified-situations.entity';
import { Intervention } from './intervention.entity';
import { FollowUpPlan } from './follow-up-plan.entity';
import { PhysicalHealthHistory } from './physical-health-history.entity';
import { MentalHealthHistory } from './mental-health-history.entity';
import { Assessment } from './assessment.entity';
import { InterventionPlan } from './intervention-plan.entity';
import { ProgressNote } from './progress-note.entity';
import { Referrals } from './referrals.entity';
import { ClosingNote } from './closing-note.entity';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  // DATOS PERSONALES
  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName: string;

  @Column({
    name: 'second_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  secondName?: string;

  @Column({ name: 'first_last_name', type: 'varchar', length: 50 })
  firstLastName: string;

  @Column({
    name: 'second_last_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  secondLastName?: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email?: string;

  // RELACIONES CON CATÁLOGOS
  @ManyToOne(() => DocumentType, { eager: true })
  @JoinColumn({ name: 'document_type_id' })
  documentType: DocumentType;

  @Column({
    name: 'document_number',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  documentNumber: string;

  @Column({ name: 'address', type: 'varchar', length: 200 })
  address: string;

  @Column({ name: 'city', type: 'varchar', length: 50 })
  city: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  @Column({ name: 'religious_affiliation', type: 'varchar', length: 100 })
  religiousAffiliation: string;

  @ManyToOne(() => Gender, { eager: true })
  @JoinColumn({ name: 'gender_id' })
  gender: Gender;

  @ManyToOne(() => MaritalStatus, { eager: true })
  @JoinColumn({ name: 'marital_status_id' })
  maritalStatus: MaritalStatus;

  @ManyToOne(() => HealthInsurance, { eager: true })
  @JoinColumn({ name: 'health_insurance_id' })
  healthInsurance: HealthInsurance;

  @Column({
    name: 'custom_health_insurance',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  customHealthInsurance?: string;

  @Column({
    name: 'referral_source',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  referralSource?: string;

  // CONTACTO DE EMERGENCIA
  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 100 })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 20 })
  emergencyContactPhone: string;

  @Column({ name: 'emergency_contact_email', type: 'varchar', length: 100 })
  emergencyContactEmail: string;

  @Column({ name: 'emergency_contact_address', type: 'varchar', length: 200 })
  emergencyContactAddress: string;

  @Column({ name: 'emergency_contact_city', type: 'varchar', length: 50 })
  emergencyContactCity: string;

  @ManyToOne(() => EmergencyContactRelationship, { eager: true })
  @JoinColumn({ name: 'emergency_contact_relationship_id' })
  emergencyContactRelationship: EmergencyContactRelationship;

  // TIMESTAMPS
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // RELACIONES
  @OneToMany(() => FamilyMember, (familyMember) => familyMember.participant, {
    cascade: true,
  })
  familyMembers: FamilyMember[];

  @OneToOne(() => BioPsychosocialHistory, { cascade: true, nullable: true })
  @JoinColumn({ name: 'bio_psychosocial_history_id' })
  bioPsychosocialHistory?: BioPsychosocialHistory;

  @OneToOne(() => ConsultationReason, { cascade: true, nullable: true })
  @JoinColumn({ name: 'consultation_reason_id' })
  consultationReason?: ConsultationReason;

  @ManyToMany(() => IdentifiedSituations, { cascade: true })
  @JoinTable({
    name: 'participant_situations',
    joinColumn: { name: 'participant_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'situation_id', referencedColumnName: 'id' },
  })
  identifiedSituations: IdentifiedSituations[];

  @OneToOne(() => Intervention, { cascade: true, nullable: true })
  @JoinColumn({ name: 'intervention_id' })
  intervention?: Intervention;

  @OneToOne(() => FollowUpPlan, { cascade: true, nullable: true })
  @JoinColumn({ name: 'follow_up_plan_id' })
  followUpPlan?: FollowUpPlan;

  @OneToOne(() => PhysicalHealthHistory, { cascade: true, nullable: true })
  @JoinColumn({ name: 'physical_health_history_id' })
  physicalHealthHistory?: PhysicalHealthHistory;

  @OneToOne(() => MentalHealthHistory, { cascade: true, nullable: true })
  @JoinColumn({ name: 'mental_health_history_id' })
  mentalHealthHistory?: MentalHealthHistory;

  @OneToOne(() => Assessment, { cascade: true, nullable: true })
  @JoinColumn({ name: 'assessment_id' })
  assessment?: Assessment;

  @OneToMany(
    () => InterventionPlan,
    (interventionPlan) => interventionPlan.participant,
    { cascade: true },
  )
  interventionPlans: InterventionPlan[];

  @OneToMany(() => ProgressNote, (progressNote) => progressNote.participant, {
    cascade: true,
  })
  progressNotes: ProgressNote[];

  @OneToOne(() => Referrals, { cascade: true, nullable: true })
  @JoinColumn({ name: 'referrals_id' })
  referrals?: Referrals;

  @OneToOne(() => ClosingNote, { cascade: true, nullable: true })
  @JoinColumn({ name: 'closing_note_id' })
  closingNote?: ClosingNote;

  // RELACIÓN CON USUARIO REGISTRADOR - Comentado temporalmente
  @Column({ name: 'registered_by_id', type: 'int' })
  registeredById: number;

  // @ManyToOne(() => User, (user) => user.participants)
  // @JoinColumn({ name: 'registered_by_id' })
  // registeredBy: User;
}
