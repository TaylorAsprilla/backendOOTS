import { AdvancedConsoleLogger, QueryRunner } from 'typeorm';

export class RedactedDatabaseLogger extends AdvancedConsoleLogger {
  override logQueryError(
    _error: string | Error,
    _query: string,
    _parameters?: unknown[],
    queryRunner?: QueryRunner,
  ): void {
    // Failed INSERT/UPDATE statements can contain an entire clinical snapshot.
    super.logQueryError(
      'Database operation failed; SQL and values redacted.',
      '[redacted]',
      undefined,
      queryRunner,
    );
  }
}
