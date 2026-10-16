import { ForbiddenException } from '@nestjs/common';
import { CaseDocumentHistoryService } from '../cases/case-document-history.service';
import { User } from '../users/entities/user.entity';
import { DocumentsService } from './documents.service';
import { DocumentGeneratorService } from './pdf/pdf.service';

describe('DocumentsService authorization', () => {
  it.each([
    'generateHelpProcessCompletion',
    'generateInterventionPlan',
    'generateClosingNote',
    'generateFullCase',
  ] as const)(
    '%s authorizes every request before rendering',
    async (method) => {
      const getDocumentCase = jest
        .fn()
        .mockRejectedValue(new ForbiddenException());
      const history = {
        getDocumentCase,
      } as unknown as CaseDocumentHistoryService;
      const service = new DocumentsService(
        history,
        {} as DocumentGeneratorService,
      );
      const user = { id: 7 } as User;
      await expect(service[method](21, user)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(getDocumentCase).toHaveBeenCalledWith(
        21,
        user,
        expect.any(String),
      );
    },
  );

  it('authorizes before looking up an individual note', async () => {
    const getDocumentCase = jest
      .fn()
      .mockRejectedValue(new ForbiddenException());
    const service = new DocumentsService(
      { getDocumentCase } as unknown as CaseDocumentHistoryService,
      {} as DocumentGeneratorService,
    );
    await expect(
      service.generateProgressNote(21, 3, { id: 7 } as User),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
