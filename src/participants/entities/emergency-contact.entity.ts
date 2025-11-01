import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ParticipantEmergencyContact } from './participant-emergency-contact.entity';

@Entity('emergency_contacts')
export class EmergencyContact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'phone', type: 'varchar', length: 20 })
  phone!: string;

  @Column({ name: 'email', type: 'varchar', length: 100 })
  email!: string;

  @Column({ name: 'address', type: 'varchar', length: 200 })
  address!: string;

  @Column({ name: 'city', type: 'varchar', length: 50 })
  city!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // RELACIÓN MANY-TO-MANY con Participant a través de tabla pivot
  @OneToMany('ParticipantEmergencyContact', 'emergencyContact')
  participantEmergencyContacts!: ParticipantEmergencyContact[];
}
