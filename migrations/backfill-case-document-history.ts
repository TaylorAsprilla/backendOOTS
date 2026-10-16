import 'reflect-metadata';
import { readFileSync } from 'fs';
import { join } from 'path';
import configuredDataSource from '../src/data-source';
import { DataSource } from 'typeorm';
import { CaseDocumentHistoryService } from '../src/cases/case-document-history.service';
import { CaseDocumentHistory } from '../src/cases/entities/case-document-history.entity';
import { CaseStatus } from '../src/common/enums';

async function migrate(): Promise<void> {
  const dataSource = new DataSource({
    ...configuredDataSource.options,
    logging: false,
    synchronize: false,
  });
  await dataSource.initialize();
  try {
    await dataSource.query(
      readFileSync(
        join(__dirname, 'create-case-document-histories.sql'),
        'utf8',
      ),
    );
    const service = new CaseDocumentHistoryService(dataSource);
    let migrated = 0;
    let lastId = 0;
    while (true) {
      const batch: { id: number }[] = await dataSource.query(
        'SELECT c.id FROM cases c LEFT JOIN case_document_histories h ON h.case_id = c.id WHERE h.case_id IS NULL AND c.id > ? ORDER BY c.id LIMIT 100',
        [lastId],
      );
      if (!batch.length) break;
      for (const { id } of batch) {
        await dataSource.transaction(async (manager) => {
          await service.lockCase(manager, id);
          if (await manager.existsBy(CaseDocumentHistory, { caseId: id }))
            return;
          const entity = await service.loadCase(manager, id);
          await service.captureOpening(manager, entity, 'legacy');
          if (entity.status === CaseStatus.CLOSED) {
            await service.freeze(manager, entity);
          }
          migrated++;
        });
        lastId = id;
      }
    }
    console.log(
      `Historical baseline created for ${migrated} existing cases. No PDF files generated.`,
    );
  } finally {
    await dataSource.destroy();
  }
}

void migrate().catch((error: unknown) => {
  // Driver errors may include SQL and clinical values; do not print them.
  console.error(
    'Historical migration failed. Check database availability and schema; rerun after correcting the cause.',
    error instanceof Error ? error.name : 'UnknownError',
  );
  process.exitCode = 1;
});
