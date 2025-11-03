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
import { EmergencyContact } from './emergency-contact.entity';
import { Relationship } from '../../common/entities/relationship.entity';

@Entity('participant_emergency_contacts')
export class ParticipantEmergencyContact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'participant_id', type: 'int', unsigned: true })
  participantId!: number;

  @Column({ name: 'emergency_contact_id', type: 'int', unsigned: true })
  emergencyContactId!: number;

  @Column({ name: 'relationship_id', type: 'int', unsigned: true })
  relationshipId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // RELACIONES
  @ManyToOne(() => Participant, (participant) => participant.emergencyContacts)
  @JoinColumn({ name: 'participant_id' })
  participant!: Participant;

  @ManyToOne(() => EmergencyContact, {
    eager: true,
  })
  @JoinColumn({ name: 'emergency_contact_id' })
  emergencyContact!: EmergencyContact;

  @ManyToOne('Relationship', { eager: true })
  @JoinColumn({ name: 'relationship_id' })
  relationship!: Relationship;
}
