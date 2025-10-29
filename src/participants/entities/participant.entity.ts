import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  DocumentType,
  Gender,
  MaritalStatus,
  HealthInsurance,
  FamilyRelationship,
} from '../../common/entities';
import { FamilyMember } from './family-member.entity';
import { Case } from './case.entity';
import { User } from '../../users/entities/user.entity';
import { BioPsychosocialHistory } from './bio-psychosocial-history.entity';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName!: string;

  @Column({
    name: 'second_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  secondName?: string;

  @Column({ name: 'first_last_name', type: 'varchar', length: 50 })
  firstLastName!: string;

  @Column({
    name: 'second_last_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  secondLastName?: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber!: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email?: string;

  @ManyToOne(() => DocumentType, { eager: true })
  @JoinColumn({ name: 'document_type_id' })
  documentType!: DocumentType;

  @Column({
    name: 'document_number',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  documentNumber!: string;

  @Column({ name: 'address', type: 'varchar', length: 200 })
  address!: string;

  @Column({ name: 'city', type: 'varchar', length: 50 })
  city!: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate!: Date;

  @Column({ name: 'religious_affiliation', type: 'varchar', length: 100 })
  religiousAffiliation!: string;

  @ManyToOne(() => Gender, { eager: true })
  @JoinColumn({ name: 'gender_id' })
  gender!: Gender;

  @ManyToOne(() => MaritalStatus, { eager: true })
  @JoinColumn({ name: 'marital_status_id' })
  maritalStatus!: MaritalStatus;

  @ManyToOne(() => HealthInsurance, { eager: true })
  @JoinColumn({ name: 'health_insurance_id' })
  healthInsurance!: HealthInsurance;

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

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 100 })
  emergencyContactName!: string;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 20 })
  emergencyContactPhone!: string;

  @Column({ name: 'emergency_contact_email', type: 'varchar', length: 100 })
  emergencyContactEmail!: string;

  @Column({ name: 'emergency_contact_address', type: 'varchar', length: 200 })
  emergencyContactAddress!: string;

  @Column({ name: 'emergency_contact_city', type: 'varchar', length: 50 })
  emergencyContactCity!: string;

  @ManyToOne(() => FamilyRelationship, { eager: true })
  @JoinColumn({ name: 'emergency_contact_relationship_id' })
  emergencyContactRelationship!: FamilyRelationship;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'registered_by_id', type: 'int', unsigned: true })
  registeredById!: number;

  // RELACIONES
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'registered_by_id' })
  registeredBy!: User;

  // INFORMACIÓN FAMILIAR BÁSICA (permanece en Participant)
  @OneToMany(() => FamilyMember, (familyMember) => familyMember.participant, {
    cascade: true,
  })
  familyMembers!: FamilyMember[];

  // HISTORIAL BIOPSICOSOCIAL (información personal del participante)
  @OneToOne(() => BioPsychosocialHistory, (history) => history.participant, {
    cascade: true,
  })
  bioPsychosocialHistory!: BioPsychosocialHistory;

  @OneToMany(() => Case, (caseEntity) => caseEntity.participant, {
    cascade: true,
  })
  cases!: Case[];
}
