import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '../../common/enums';
import { DocumentType } from '../../document-types/entities';
import { Geolocation } from '../../geolocation/entities/geolocation.entity';
// import { Participant } from '../../participants/entities/participant.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', {
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

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

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
  })
  @Exclude()
  password: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phoneNumber?: string;

  @Column({
    name: 'position',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  position?: string;

  @Column({
    name: 'headquarters',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  headquarters?: string;

  @Column({
    name: 'document_number',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  documentNumber?: string;

  @Column({
    name: 'address',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  address?: string;

  @Column({
    name: 'city',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city?: string;

  @Column({
    name: 'birth_date',
    type: 'date',
    nullable: true,
  })
  birthDate?: Date;

  @Column({
    name: 'document_type_id',
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  documentTypeId?: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // RELACIONES
  @ManyToOne(() => DocumentType, { nullable: true })
  @JoinColumn({ name: 'document_type_id' })
  documentType?: DocumentType;

  @OneToMany(() => Geolocation, (geolocation) => geolocation.user)
  geolocations: Geolocation[];

  // RELACIONES - Comentado temporalmente para evitar errores de compilación
  // @OneToMany(() => Participant, (participant) => participant.registeredBy)
  // participants: Participant[];

  // MÉTODOS
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toResponseObject() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = this;
    return result;
  }
}
