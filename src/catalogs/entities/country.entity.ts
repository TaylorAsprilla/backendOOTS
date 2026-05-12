import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ name: 'code', type: 'varchar', length: 10, unique: true })
  code!: string; // Ejemplo: es-CO, es-PR, en

  // Relations can be added later if needed
}
