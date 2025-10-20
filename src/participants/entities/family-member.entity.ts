import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FamilyRelationship, AcademicLevel } from '../../common/entities';
import { Participant } from './participant.entity';

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: Date;

  @Column({
    name: 'occupation',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  occupation?: string;

  // RELACIONES CON CATÁLOGOS
  @ManyToOne(() => FamilyRelationship, { eager: true })
  @JoinColumn({ name: 'relationship_id' })
  relationship: FamilyRelationship;

  @ManyToOne(() => AcademicLevel, { eager: true, nullable: true })
  @JoinColumn({ name: 'academic_level_id' })
  academicLevel?: AcademicLevel;

  @Column({ name: 'participant_id', type: 'int' })
  participantId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // RELACIONES
  @ManyToOne(() => Participant, (participant) => participant.familyMembers)
  @JoinColumn({ name: 'participant_id' })
  participant: Participant;
}
