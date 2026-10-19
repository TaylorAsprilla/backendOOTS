import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from './enums/role.enum';
import { ParticipantsController } from '../participants/participants.controller';
import { ParticipantsService } from '../participants/participants.service';
import { Participant } from '../participants/entities/participant.entity';
import { Case } from '../participants/entities/case.entity';
import { CasesController } from '../cases/cases.controller';
import { CasesService } from '../cases/cases.service';
import { PdfService } from '../cases/pdf.service';
import { CaseDocumentHistoryService } from '../cases/case-document-history.service';
import { UsersController } from '../users/users.controller';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';

type Row = {
  id: number;
  countryId?: number;
  registeredById?: number;
  createdById?: number;
  participant?: { countryId?: number };
};

describe('ADMIN_COUNTRY HTTP country isolation', () => {
  let app: INestApplication;
  const actor = (countryId?: number, role = Role.ADMIN_COUNTRY) =>
    Object.assign(new User(), { id: 99, countryId, role: { name: role } });
  const usParticipants = [
    { id: 12, countryId: 3, registeredById: 7, firstName: 'US A' },
    { id: 13, countryId: 3, registeredById: 8, firstName: 'US B' },
  ];
  const participants = [
    ...usParticipants,
    { id: 14, countryId: 1 },
    { id: 15 },
  ];
  const cases = [
    { id: 41, createdById: 7, participant: usParticipants[0] },
    { id: 42, createdById: 8, participant: usParticipants[1] },
    { id: 43, createdById: 7, participant: { id: 14, countryId: 1 } },
    { id: 44, participant: { id: 15 } },
  ];
  const users = [
    { id: 7, countryId: 3 },
    { id: 8, countryId: 3 },
    { id: 9, countryId: 1 },
    { id: 10 },
  ];

  // A small in-memory repository evaluates the actual service's country predicates.
  const repository = <T extends Row>(rows: T[]) => {
    const matches = (row: T, where: Record<string, unknown>) =>
      Object.entries(where).every(
        ([key, value]) => Reflect.get(row, key) === value,
      );
    return {
      findOne: jest.fn(({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(
          rows.find((row) =>
            matches(
              row,
              Object.fromEntries(
                Object.entries(where).filter(([key]) => key !== 'status'),
              ),
            ),
          ) ?? null,
        ),
      ),
      find: jest.fn(({ where = {} }: { where?: Record<string, unknown> }) =>
        Promise.resolve(rows.filter((row) => matches(row, where))),
      ),
      count: jest.fn(({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(rows.filter((row) => matches(row, where)).length),
      ),
      createQueryBuilder: jest.fn(() => {
        let filtered = [...rows];
        const predicate = (
          sql: string,
          params: { countryId?: number; userId?: number },
        ) => {
          if (sql.includes('countryId =')) {
            filtered = filtered.filter(
              (row) =>
                (sql.startsWith('participant.') && row.participant
                  ? row.participant.countryId
                  : row.countryId) === params.countryId,
            );
          }
          if (sql.includes('createdById =')) {
            filtered = filtered.filter(
              (row) => row.createdById === params.userId,
            );
          }
        };
        const query = {
          setFindOptions: jest.fn(
            ({ where = {} }: { where?: Record<string, unknown> }) => {
              filtered = filtered.filter((row) => matches(row, where));
              return query;
            },
          ),
          where: jest.fn(
            (sql: string, params: { countryId?: number; userId?: number }) => {
              predicate(sql, params);
              return query;
            },
          ),
          andWhere: jest.fn(
            (sql: string, params: { countryId?: number; userId?: number }) => {
              predicate(sql, params);
              return query;
            },
          ),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          loadRelationCountAndMap: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getMany: jest.fn(() => Promise.resolve(filtered)),
          getManyAndCount: jest.fn(() =>
            Promise.resolve([filtered, filtered.length]),
          ),
          getRawAndEntities: jest.fn(() =>
            Promise.resolve({
              entities: filtered,
              raw: filtered.map(() => ({})),
            }),
          ),
        };
        return query;
      }),
    };
  };

  beforeAll(async () => {
    const participantRepository = repository(
      participants,
    ) as unknown as Repository<Participant>;
    const module = await Test.createTestingModule({
      controllers: [ParticipantsController, CasesController, UsersController],
      providers: [
        {
          provide: ParticipantsService,
          useValue: new ParticipantsService(participantRepository),
        },
        {
          provide: CasesService,
          useValue: new CasesService(
            repository(cases) as unknown as Repository<Case>,
            participantRepository,
            {} as DataSource,
            {} as CaseDocumentHistoryService,
          ),
        },
        {
          provide: UsersService,
          useValue: new UsersService(
            repository(users) as unknown as Repository<User>,
            {} as MailService,
          ),
        },
        { provide: PdfService, useValue: {} },
        { provide: CaseDocumentHistoryService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest();
          const identity = req.headers.authorization;
          if (!identity) throw new UnauthorizedException();
          req.user =
            identity === 'admin'
              ? actor(undefined, Role.ADMIN)
              : identity === 'unassigned'
                ? actor()
                : actor(3);
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    app.useLogger(false);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each([
    ['/participants', 'data', [12, 13]],
    ['/participants?countryId=3', 'data', [12, 13]],
    ['/participants/all', 'data', [12, 13]],
    ['/participants/by-country/3', 'participants', [12, 13]],
    ['/participants/by-user/7', 'participants', [12]],
    ['/cases', 'data', [41, 42]],
    ['/cases/all', 'data', [41, 42]],
    ['/cases/by-country/3', 'cases', [41, 42]],
    ['/cases/by-user/7', 'cases', [41]],
  ])(
    'limits %s to US records without client country filters',
    async (url, field, ids) => {
      const response = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', 'us')
        .expect(200);
      expect(response.body[field].map((row: Row) => row.id)).toEqual(ids);
    },
  );

  it('returns only same-country users, including when deleted users are requested', async () => {
    for (const url of ['/users', '/users/all/with-deleted']) {
      const response = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', 'us')
        .expect(200);
      expect(response.body.map((row: Row) => row.id)).toEqual([7, 8]);
    }
  });

  it.each(['/participants/12', '/cases/41', '/users/7'])(
    'allows same-country detail %s',
    async (url) => {
      await request(app.getHttpServer())
        .get(url)
        .set('Authorization', 'us')
        .expect(200);
    },
  );

  it.each([
    '/participants/14',
    '/participants/15',
    '/cases/43',
    '/cases/44',
    '/users/9',
    '/users/10',
    '/participants/by-country/1',
    '/cases/by-country/1',
    '/users?countryId=1',
    '/participants?countryId=1',
    '/cases?countryId=1',
  ])(
    'rejects foreign or unassigned records and spoofed country: %s',
    async (url) => {
      await request(app.getHttpServer())
        .get(url)
        .set('Authorization', 'us')
        .expect(403);
    },
  );

  it.each([
    '/participants',
    '/cases',
    '/cases/by-user/7',
    '/users',
    '/participants/by-country/3',
  ])('fails closed without an assigned country: %s', async (url) => {
    await request(app.getHttpServer())
      .get(url)
      .set('Authorization', 'unassigned')
      .expect(403);
  });

  it('preserves global ADMIN access and still requires authentication', async () => {
    const response = await request(app.getHttpServer())
      .get('/participants/all')
      .set('Authorization', 'admin')
      .expect(200);
    expect(response.body.data).toHaveLength(4);
    await request(app.getHttpServer()).get('/participants').expect(401);
  });

  it('keeps user management read-only even for same-country users', async () => {
    await request(app.getHttpServer())
      .patch('/users/7')
      .set('Authorization', 'us')
      .send({})
      .expect(403);
    await request(app.getHttpServer())
      .delete('/users/7')
      .set('Authorization', 'us')
      .expect(403);
    await request(app.getHttpServer())
      .patch('/users/7/restore')
      .set('Authorization', 'us')
      .send({})
      .expect(403);
  });
});
