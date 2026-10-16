import { AdvancedConsoleLogger } from 'typeorm';
import { RedactedDatabaseLogger } from './redacted-database.logger';

describe('RedactedDatabaseLogger', () => {
  it('never sends clinical SQL values or driver messages to the console logger', () => {
    const output = jest
      .spyOn(AdvancedConsoleLogger.prototype, 'logQueryError')
      .mockImplementation();
    try {
      new RedactedDatabaseLogger(['error']).logQueryError(
        'Sensitive driver message',
        'INSERT INTO clinical_table VALUES (?)',
        ['Sensitive clinical data'],
      );
      expect(output).toHaveBeenCalledWith(
        'Database operation failed; SQL and values redacted.',
        '[redacted]',
        undefined,
        undefined,
      );
    } finally {
      output.mockRestore();
    }
  });
});
