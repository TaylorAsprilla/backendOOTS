import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodeToCountry1683820000010 implements MigrationInterface {
  name = 'AddCodeToCountry1683820000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE countries ADD COLUMN code VARCHAR(10) UNIQUE NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE countries DROP COLUMN code`);
  }
}
