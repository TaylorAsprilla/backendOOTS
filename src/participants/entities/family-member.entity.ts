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
import { Relationship, AcademicLevel } from '../../common/entities';

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate!: Date;

  @Column({ name: 'occupation', type: 'varchar', length: 200 })
  occupation!: string;

  @Column({ name: 'participant_id', type: 'int' })
  participantId!: number;

  @Column({ name: 'family_relationship_id', type: 'int' })
  familyRelationshipId!: number;

  @Column({ name: 'academic_level_id', type: 'int' })
  academicLevelId!: number;

  @ManyToOne(() => Participant, (participant) => participant.familyMembers)
  @JoinColumn({ name: 'participant_id' })
  participant!: Participant;

  @ManyToOne(() => Relationship, { eager: true })
  @JoinColumn({ name: 'family_relationship_id' })
  familyRelationship!: Relationship;

  @ManyToOne(() => AcademicLevel, { eager: true })
  @JoinColumn({ name: 'academic_level_id' })
  academicLevel!: AcademicLevel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
