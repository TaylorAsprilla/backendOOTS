import 'reflect-metadata';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { config } from 'dotenv';
import { ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CaseStatus, CaseType, Role } from '../common/enums';
import { User } from '../users/entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { Participant } from '../participants/entities/participant.entity';
import { Case } from '../participants/entities/case.entity';
import { Gender } from '../genders/entities/gender.entity';
import { FamilyRelationship } from '../family-relationship/entities/family-relationship.entity';
import { AcademicLevel } from '../academic-levels/entities/academic-level.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { FamilyMember } from '../participants/entities/family-member.entity';
import { ParticipantsService } from '../participants/participants.service';
import { DocumentsService } from '../documents/documents.service';
import { DocumentGeneratorService } from '../documents/pdf/pdf.service';
import { getPrinter } from '../documents/pdf/pdf-shared';
import { CaseDiscussion } from '../case-discussions/entities/case-discussion.entity';
import { CaseDiscussionsPdfService } from '../case-discussions/case-discussions-pdf.service';
import { CasesService } from './cases.service';
import { PdfService } from './pdf.service';
import { CaseDocumentHistoryService } from './case-document-history.service';
import { CaseDocumentHistory } from './entities/case-document-history.entity';

interface LayoutDocument {
  _pdfMakePages: {
    items: { type: string; item: { inlines?: { text: string }[] } }[];
  }[];
}

const databaseDescribe =
  process.env.CASE_HISTORY_DB_TEST === 'true' ? describe : describe.skip;

databaseDescribe('Dynamic historical PDFs (local MySQL, rolled back)', () => {
  it('preserves active/closed content, authorizes downloads and never writes PDF files', async () => {
    const environment = config({
      path: join(__dirname, '..', '..', '.env'),
      quiet: true,
    });
    expect(['localhost', '127.0.0.1', '::1']).toContain(process.env.DB_HOST);
    expect(environment.parsed?.NODE_ENV).toBe('development');
    const source = new DataSource({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3307),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      timezone: 'Z',
      synchronize: false,
      logging: false,
      entities: [join(__dirname, '..', '**', '*.entity.ts')],
    });
    await source.initialize();
    const runner = source.createQueryRunner();
    let caseId: number | undefined;
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const debug = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    const fs = jest.requireActual<typeof import('fs')>('fs');
    const printer = getPrinter() as {
      createPdfKitDocument: (definition: unknown) => LayoutDocument;
    };
    const createDocument: (definition: unknown) => LayoutDocument =
      printer.createPdfKitDocument.bind(printer);
    const rendered: string[] = [];
    const print = jest
      .spyOn(printer, 'createPdfKitDocument')
      .mockImplementation((definition) => {
        const document = createDocument(definition);
        rendered.push(
          document._pdfMakePages
            .flatMap((page) =>
              page.items
                .filter((item) => item.type === 'line')
                .map(
                  (item) =>
                    item.item.inlines?.map((inline) => inline.text).join('') ??
                    '',
                ),
            )
            .join('\n'),
        );
        return document;
      });
    const writes = [
      jest.spyOn(fs, 'writeFileSync'),
      jest.spyOn(fs, 'writeFile'),
      jest.spyOn(fs, 'createWriteStream'),
    ];
    try {
      await runner.startTransaction();
      const manager = runner.manager;
      const scoped = Object.assign(Object.create(source) as DataSource, {
        transaction: manager.transaction.bind(manager),
        getRepository: manager.getRepository.bind(manager),
      });
      const history = new CaseDocumentHistoryService(scoped);
      const cases = new CasesService(
        manager.getRepository(Case),
        manager.getRepository(Participant),
        scoped,
        history,
      );
      const participants = new ParticipantsService(
        manager.getRepository(Participant),
      );
      const generator = new DocumentGeneratorService();
      const documents = new DocumentsService(history, generator);
      const fixture = await manager.findOne(Participant, { where: {} });
      expect(fixture).not.toBeNull();
      const role = await manager.findOneByOrFail(RoleEntity, {
        name: Role.ADMIN,
      });
      const suffix = randomUUID().slice(0, 8);
      const actor = await manager.save(
        manager.create(User, {
          firstName: 'HistoricalProfessional',
          firstLastName: 'Original',
          email: `pdf-${suffix}@example.test`,
          password: randomUUID(),
          roleId: role.id,
          countryId: fixture!.countryId,
        }),
      );
      actor.role = role;
      const gender = await manager.save(
        manager.create(Gender, { name: `OriginalGender-${suffix}` }),
      );
      const relationship = await manager.save(
        manager.create(FamilyRelationship, {
          name: `OriginalRelation-${suffix}`,
        }),
      );
      const academic = await manager.save(
        manager.create(AcademicLevel, { name: `OriginalEducation-${suffix}` }),
      );
      const birthDate = new Date();
      birthDate.setUTCFullYear(birthDate.getUTCFullYear() - 35);
      const participant = await participants.create(
        {
          firstName: 'HistoricalParticipant',
          firstLastName: 'Original',
          phoneNumber: '0000000000',
          address: 'HistoricalAddressA',
          city: 'TestCity',
          birthDate: birthDate.toISOString().slice(0, 10),
          religiousAffiliation: 'Test',
          genderId: gender.id,
          maritalStatusId: fixture!.maritalStatusId,
          healthInsuranceId: fixture!.healthInsuranceId,
          countryId: fixture!.countryId,
          registeredById: actor.id,
        },
        actor,
      );
      const created = await cases.createCase(
        {
          participantId: participant.id,
          caseType: CaseType.ACTIVE_CASE,
          bioPsychosocialHistory: {},
          familyMembers: [
            {
              name: 'HistoricalFamily',
              age: 10,
              occupation: 'Student',
              familyRelationshipId: relationship.id,
              academicLevelId: academic.id,
            },
          ],
          followUpPlan: [
            { coordinatedService: true, otherDetails: 'HistoricalFollowUp' },
          ],
          interventionPlans: [
            {
              goal: 'HistoricalIntervention',
              evaluationCriteria: 'HistoricalEvaluation',
            },
          ],
          closingNote: {
            reason: 'HistoricalClosing',
            closingDate: '2026-10-15',
          },
        },
        actor.id,
      );
      caseId = created.id;
      expect(
        (await history.getDocumentCase(caseId, actor)).participantAge,
      ).toBe(35);

      await cases.updateCase(
        caseId,
        {
          progressNotes: [
            { startDate: '2026-10-01', summary: 'HistoricalNoteOne' },
          ],
        },
        actor.id,
      );
      const first = await documents.generateFullCase(caseId, actor);
      expect(first.buffer.subarray(0, 5).toString()).toBe('%PDF-');
      const firstText = rendered.at(-1)!;
      expect(firstText).toContain('HistoricalNoteOne');
      expect(firstText).not.toContain('HistoricalNoteTwo');
      await participants.update(
        participant.id,
        { address: 'CurrentAddressB' },
        actor,
      );
      await cases.updateCase(
        caseId,
        {
          progressNotes: [
            { startDate: '2026-10-01', summary: 'HistoricalNoteOne' },
            { startDate: '2026-10-02', summary: 'HistoricalNoteTwo' },
          ],
          familyMembers: [
            {
              name: 'RevisedHistoricalFamily',
              age: 11,
              occupation: 'Student',
              familyRelationshipId: relationship.id,
              academicLevelId: academic.id,
            },
          ],
        },
        actor.id,
      );
      await documents.generateFullCase(caseId, actor);
      expect(rendered.at(-1)).toContain('HistoricalNoteTwo');
      expect(rendered.at(-1)).toContain('RevisedHistoricalFamily');
      expect(rendered.at(-1)).toContain('HistoricalAddressA');
      expect(rendered.at(-1)).not.toContain('CurrentAddressB');

      const discussion = await manager.save(
        manager.create(CaseDiscussion, {
          caseId,
          participantId: participant.id,
          socialWorkerId: actor.id,
          supervisorId: actor.id,
          createdById: actor.id,
          discussionDate: '2026-10-02',
          clientNameSnapshot: 'HistoricalParticipant Original',
          clientAgeSnapshot: 35,
          presentedSituations: 'HistoricalDiscussion',
        }),
      );
      let failClosing = true;
      source.subscribers.push({
        beforeUpdate(event) {
          if (failClosing && event.metadata.target === CaseDocumentHistory) {
            throw new Error('Simulated historical write failure');
          }
        },
      });
      await expect(
        cases.updateStatus(caseId, { status: CaseStatus.CLOSED }, actor.id),
      ).rejects.toThrow('No se pudo conservar el histórico');
      expect((await manager.findOneByOrFail(Case, { id: caseId })).status).toBe(
        CaseStatus.OPEN,
      );
      failClosing = false;
      await cases.updateStatus(caseId, { status: CaseStatus.CLOSED }, actor.id);
      await documents.generateFullCase(caseId, actor);
      const closedText = rendered.at(-1)!;
      const stored = await manager.findOneByOrFail(CaseDocumentHistory, {
        caseId,
      });
      expect(JSON.stringify(stored)).not.toContain('password');
      expect(stored.source).toBe('creation');

      // Even direct changes to related rows cannot alter a closed document.
      await participants.update(
        participant.id,
        { address: 'LaterAddressC' },
        actor,
      );
      await manager.update(User, actor.id, {
        firstName: 'ChangedProfessional',
      });
      await manager.update(Gender, gender.id, {
        name: `ChangedGender-${suffix}`,
      });
      await manager.update(FamilyRelationship, relationship.id, {
        name: `ChangedRelation-${suffix}`,
      });
      await manager.update(FamilyMember, { caseId }, { name: 'ChangedFamily' });
      await manager.update(
        ProgressNote,
        { caseId },
        { summary: 'ChangedNote' },
      );
      await manager.update(CaseDiscussion, discussion.id, {
        presentedSituations: 'ChangedDiscussion',
      });
      jest.useFakeTimers({
        doNotFake: [
          'hrtime',
          'nextTick',
          'performance',
          'queueMicrotask',
          'setImmediate',
          'clearImmediate',
          'setInterval',
          'clearInterval',
          'setTimeout',
          'clearTimeout',
        ],
      });
      jest.setSystemTime(new Date(Date.now() + 183 * 86400000));
      try {
        await documents.generateFullCase(caseId, actor);
        expect(rendered.at(-1)).toBe(closedText);
      } finally {
        jest.useRealTimers();
      }
      expect(closedText).toContain('HistoricalProfessional');
      expect(closedText).toContain('OriginalGender');
      expect(closedText).toContain('RevisedHistoricalFamily');
      expect(closedText).toContain('HistoricalFollowUp');
      expect(closedText).toContain('HistoricalIntervention');
      expect(closedText).not.toContain('ChangedNote');
      const noteId = stored.closedSnapshot!.progressNotes[0].id;
      await documents.generateProgressNote(caseId, noteId, actor);
      expect(rendered.at(-1)).toContain('HistoricalNoteOne');
      await documents.generateInterventionPlan(caseId, actor);
      expect(rendered.at(-1)).toContain('HistoricalEvaluation');
      await documents.generateHelpProcessCompletion(caseId, actor);
      expect(rendered.at(-1)).toContain('HistoricalAddressA');
      await documents.generateClosingNote(caseId, actor);
      expect(rendered.at(-1)).toContain('HistoricalClosing');
      const frozenDiscussion = (
        await history.getDocumentContext(caseId, actor, Number(discussion.id))
      ).discussions[0];
      expect(frozenDiscussion.presentedSituations).toBe('HistoricalDiscussion');
      expect(frozenDiscussion.socialWorker.firstName).toBe(
        'HistoricalProfessional',
      );
      const discussionPdf =
        await new CaseDiscussionsPdfService().generateDiscussionPdf(
          Object.assign(frozenDiscussion, { case: stored.closedSnapshot }),
        );
      expect(discussionPdf.buffer.subarray(0, 5).toString()).toBe('%PDF-');
      const legacy = await new PdfService().generateCasePdf(
        stored.closedSnapshot!,
        stored.responsibleSnapshot!,
      );
      expect(legacy.subarray(0, 5).toString()).toBe('%PDF-');

      const outsider = Object.assign(new User(), actor, {
        id: actor.id + 99999,
        role: { name: Role.TRABAJO_SOCIAL },
      });
      await expect(
        documents.generateFullCase(caseId, outsider),
      ).rejects.toBeInstanceOf(ForbiddenException);
      const otherCountry = Object.assign(new User(), actor, {
        countryId: (stored.countryId ?? 0) + 99999,
        role: { name: Role.ADMIN_COUNTRY },
      });
      await expect(
        documents.generateFullCase(caseId, otherCountry),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        cases.updateStatus(caseId, { status: CaseStatus.OPEN }, actor.id),
      ).rejects.toBeInstanceOf(ConflictException);
      await expect(
        cases.updateCase(caseId, { consultationReason: 'Changed' }, actor.id),
      ).rejects.toBeInstanceOf(ConflictException);
      for (const write of writes) expect(write).not.toHaveBeenCalled();
      await runner.rollbackTransaction();
      expect(await source.getRepository(Case).countBy({ id: caseId })).toBe(0);
      expect(
        await source.getRepository(CaseDocumentHistory).countBy({ caseId }),
      ).toBe(0);
    } finally {
      writes.forEach((write) => write.mockRestore());
      print.mockRestore();
      log.mockRestore();
      debug.mockRestore();
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      await runner.release();
      await source.destroy();
    }
  }, 120000);
});
