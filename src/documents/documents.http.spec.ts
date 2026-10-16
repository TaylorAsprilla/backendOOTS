import { randomUUID } from 'crypto';
import { Server } from 'http';
import {
  INestApplication,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AuthService, JwtPayload } from '../auth/auth.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { CaseStatus, Role } from '../common/enums';
import { User } from '../users/entities/user.entity';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { FamilyMember } from '../participants/entities/family-member.entity';
import { CaseDocumentHistoryService } from '../cases/case-document-history.service';
import { CaseDocumentHistory } from '../cases/entities/case-document-history.entity';
import { CasesController } from '../cases/cases.controller';
import { CasesService } from '../cases/cases.service';
import { PdfService } from '../cases/pdf.service';
import { CaseDiscussion } from '../case-discussions/entities/case-discussion.entity';
import { CaseDiscussionFamilyMember } from '../case-discussions/entities/case-discussion-family-member.entity';
import { CaseDiscussionsController } from '../case-discussions/case-discussions.controller';
import { CaseDiscussionsService } from '../case-discussions/case-discussions.service';
import { CaseDiscussionsPdfService } from '../case-discussions/case-discussions-pdf.service';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentGeneratorService } from './pdf/pdf.service';

jest.mock('../auth/auth.service', () => ({
  AuthService: class AuthService {},
}));

describe('All PDF HTTP routes: JWT and case authorization', () => {
  let app: INestApplication;
  let server: Server;
  let jwt: JwtService;
  const pdf = Buffer.from('%PDF-test');
  const endpoints = [
    '/cases/:id/pdf',
    '/cases/:id/documents/full-case/pdf',
    '/cases/:id/documents/progress-notes/3/pdf',
    '/cases/:id/documents/intervention-plan/pdf',
    '/cases/:id/documents/help-process-completion/pdf',
    '/cases/:id/documents/closing-note/pdf',
    '/cases/:id/discussions/3/pdf',
  ];
  const users = new Map([
    [
      1,
      Object.assign(new User(), {
        id: 1,
        countryId: 1,
        role: { name: Role.ADMIN },
      }),
    ],
    [
      2,
      Object.assign(new User(), {
        id: 2,
        countryId: 1,
        role: { name: Role.ADMIN_COUNTRY },
      }),
    ],
    [
      7,
      Object.assign(new User(), {
        id: 7,
        countryId: 1,
        role: { name: Role.TRABAJO_SOCIAL },
      }),
    ],
  ]);
  const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

  beforeAll(async () => {
    const secret = randomUUID();
    jwt = new JwtService({ secret });
    const manager = {
      findOne: jest.fn(
        (
          target: unknown,
          options: { where: { id?: number; caseId?: number } },
        ) => {
          const id = options.where.id ?? options.where.caseId;
          return Promise.resolve(
            target === Case
              ? {
                  id,
                  status: CaseStatus.CLOSED,
                  createdById: id === 21 ? 7 : 8,
                }
              : { caseId: id, countryId: id === 21 ? 1 : 2 },
          );
        },
      ),
      findOneBy: jest.fn((_target: unknown, where: { caseId: number }) =>
        Promise.resolve(
          Object.assign(new CaseDocumentHistory(), {
            caseId: where.caseId,
            closedSnapshot: Object.assign(new Case(), {
              id: where.caseId,
              closingNote: {},
              progressNotes: [{ id: 3 }],
              interventionPlans: [{}],
              followUpPlans: [{}],
            }),
            discussionsSnapshot: [
              Object.assign(new CaseDiscussion(), {
                id: 3,
                caseId: where.caseId,
              }),
            ],
          }),
        ),
      ),
    };
    const module = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [
        DocumentsController,
        CasesController,
        CaseDiscussionsController,
      ],
      providers: [
        DocumentsService,
        CaseDiscussionsService,
        CaseDocumentHistoryService,
        JwtStrategy,
        {
          provide: DataSource,
          useValue: {
            transaction: (
              _level: string,
              callback: (value: typeof manager) => Promise<unknown>,
            ) => callback(manager),
          },
        },
        { provide: CasesService, useValue: {} },
        { provide: ConfigService, useValue: { getOrThrow: () => secret } },
        {
          provide: AuthService,
          useValue: {
            validateUser: (payload: JwtPayload) => {
              const user = users.get(Number(payload.sub));
              if (!user) throw new UnauthorizedException();
              return Promise.resolve(user);
            },
          },
        },
        {
          provide: PdfService,
          useValue: { generateCasePdf: () => Promise.resolve(pdf) },
        },
        {
          provide: DocumentGeneratorService,
          useValue: Object.fromEntries(
            [
              'generateFullCase',
              'generateHelpProcessCompletion',
              'generateInterventionPlan',
              'generateProgressNote',
              'generateClosingNote',
            ].map((method) => [method, () => Promise.resolve(pdf)]),
          ),
        },
        {
          provide: CaseDiscussionsPdfService,
          useValue: {
            generateDiscussionPdf: () =>
              Promise.resolve({ buffer: pdf, filename: 'discussion.pdf' }),
          },
        },
        ...[
          CaseDiscussion,
          CaseDiscussionFamilyMember,
          Case,
          Participant,
          User,
          FamilyMember,
        ].map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: {},
        })),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app?.close();
    log.mockRestore();
    warn.mockRestore();
  });

  const token = (id: number) =>
    jwt.sign({
      sub: id,
      role: users.get(id)?.role?.name,
    });

  it.each(endpoints)('%s rejects a request without JWT', async (endpoint) => {
    await request(server).get(endpoint.replace(':id', '21')).expect(401);
  });

  it.each(endpoints)(
    '%s denies another social worker case even with a valid JWT',
    async (endpoint) => {
      await request(server)
        .get(endpoint.replace(':id', '22'))
        .auth(token(7), { type: 'bearer' })
        .expect(403);
    },
  );

  it.each(endpoints)(
    '%s denies another country even with a valid JWT',
    async (endpoint) => {
      await request(server)
        .get(endpoint.replace(':id', '22'))
        .auth(token(2), { type: 'bearer' })
        .expect(403);
    },
  );

  it.each(endpoints)(
    '%s lets the creator download without caching the response',
    async (endpoint) => {
      await request(server)
        .get(endpoint.replace(':id', '21'))
        .auth(token(7), { type: 'bearer' })
        .expect(200)
        .expect('Content-Type', 'application/pdf')
        .expect('Cache-Control', 'no-store');
    },
  );

  it.each(endpoints)('%s lets ADMIN download any case', async (endpoint) => {
    await request(server)
      .get(endpoint.replace(':id', '22'))
      .auth(token(1), { type: 'bearer' })
      .expect(200);
  });

  it('rejects an expired JWT', async () => {
    const expired = jwt.sign({
      sub: 7,
      exp: Math.floor(Date.now() / 1000) - 60,
    });
    await request(server)
      .get('/cases/21/documents/full-case/pdf')
      .auth(expired, { type: 'bearer' })
      .expect(401);
  });

  it('rejects note and discussion IDs that do not belong to the authorized case', async () => {
    for (const endpoint of [
      '/cases/21/documents/progress-notes/999/pdf',
      '/cases/21/discussions/999/pdf',
    ]) {
      await request(server)
        .get(endpoint)
        .auth(token(7), { type: 'bearer' })
        .expect(404);
    }
  });
});
