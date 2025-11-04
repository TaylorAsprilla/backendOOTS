import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Participant } from './participant.entity';
import { FamilyRelationship } from '../../family-relationship/entities';
import { AcademicLevel } from '../../common/entities';

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate!: Date;

  @Column({ name: 'occupation', type: 'varchar', length: 200 })
  occupation!: string;

  @Column({ name: 'participant_id', type: 'int', unsigned: true })
  participantId!: number;

  @Column({ name: 'family_relationship_id', type: 'int', unsigned: true })
  familyRelationshipId!: number;

  @Column({ name: 'academic_level_id', type: 'int', unsigned: true })
  academicLevelId!: number;

  @ManyToOne(() => Participant, (participant) => participant.familyMembers)
  @JoinColumn({ name: 'participant_id' })
  participant!: Participant;

  @ManyToOne(() => FamilyRelationship, { eager: true })
  @JoinColumn({ name: 'family_relationship_id' })
  familyRelationship!: FamilyRelationship;

  @ManyToOne('AcademicLevel', { eager: true })
  @JoinColumn({ name: 'academic_level_id' })
  academicLevel!: AcademicLevel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
