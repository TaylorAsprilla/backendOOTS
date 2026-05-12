import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountryToUsersAndParticipants1683820000000
  implements MigrationInterface
{
  name = 'AddCountryToUsersAndParticipants1683820000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE countries (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    )`);
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN country_id INT UNSIGNED NULL, ADD CONSTRAINT FK_users_country FOREIGN KEY (country_id) REFERENCES countries(id)`,
    );
    await queryRunner.query(
      `ALTER TABLE participants ADD COLUMN country_id INT UNSIGNED NULL, ADD CONSTRAINT FK_participants_country FOREIGN KEY (country_id) REFERENCES countries(id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE participants DROP FOREIGN KEY FK_participants_country`,
    );
    await queryRunner.query(`ALTER TABLE participants DROP COLUMN country_id`);
    await queryRunner.query(
      `ALTER TABLE users DROP FOREIGN KEY FK_users_country`,
    );
    await queryRunner.query(`ALTER TABLE users DROP COLUMN country_id`);
    await queryRunner.query(`DROP TABLE countries`);
  }
}
