import { ForbiddenException } from '@nestjs/common';
import { CaseDocumentHistoryService } from '../cases/case-document-history.service';
import { User } from '../users/entities/user.entity';
import { DocumentsService } from './documents.service';
import { DocumentGeneratorService } from './pdf/pdf.service';
import { Case } from '../participants/entities/case.entity';
import { CaseStatus } from '../common/enums';

describe('DocumentsService authorization', () => {
  it.each([
    [CaseStatus.OPEN, 'Aún no puede descargar la nota de cierre. Registre y guarde la nota en la sección «Nota de cierre» del caso y vuelva a intentarlo.'],
    [CaseStatus.CLOSED, 'No se puede descargar la nota de cierre: no se registró antes de cerrar el expediente. Contacte al administrador.'],
  ])('explains the missing closing note for a %s case', async (status, message) => {
    const getDocumentCase = jest.fn().mockResolvedValue(
      Object.assign(new Case(), { id: 33, status }),
    );
    const service = new DocumentsService(
      { getDocumentCase } as unknown as CaseDocumentHistoryService,
      {} as DocumentGeneratorService,
    );
    await expect(service.generateClosingNote(33, new User())).rejects.toThrow(message);
  });

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
