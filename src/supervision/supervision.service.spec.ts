import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { SupervisionService } from './supervision.service';
import { SupervisionReview } from './supervision-review.entity';
import {
  ItemStatus,
  ReviewStatus,
  ReviewType,
  itemKeys,
} from './supervision.catalog';

const user = (id: number, role: Role, countryId = 1) =>
  Object.assign(new User(), { id, countryId, role: { name: role } });

const supervisor = user(20, Role.SUPERVISOR);
const admin = user(1, Role.ADMIN);
const countryAdmin = user(2, Role.ADMIN_COUNTRY, 3);

const makeService = (
  stored?: Partial<SupervisionReview>,
  other: Record<string, unknown> = {},
) => {
  const save = jest.fn((value: unknown) =>
    Promise.resolve({ id: 5, ...(value as object) }),
  );
  const reviews = {
    create: jest.fn((value: unknown) => value),
    save,
    findOne: jest.fn().mockResolvedValue(stored),
  };
  const cases = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: 4, participant: { countryId: 1 } }),
  };
  const users = {
    findOne: jest.fn().mockResolvedValue({
      id: 30,
      countryId: 1,
      role: { name: Role.PSICOLOGO },
    }),
    ...other,
  };
  const none = { count: jest.fn().mockResolvedValue(0) };
  const service = new SupervisionService(
    reviews as never,
    cases as never,
    users as never,
    none as never,
    none as never,
    none as never,
    none as never,
    none as never,
    none as never,
    none as never,
  );
  return { service, save, reviews };
};

const review = (
  extra: Partial<SupervisionReview> = {},
): Partial<SupervisionReview> => ({
  id: 5,
  type: ReviewType.SUPERVISEE_FILE,
  superviseeId: 30,
  supervisee: { countryId: 1 } as User,
  reviewerId: 20,
  items: {},
  status: ReviewStatus.DRAFT,
  ...extra,
});

describe('SupervisionService', () => {
  it('creates a draft for a supervisee', async () => {
    const { service, save } = makeService(review());
    await service.create(
      { type: ReviewType.SUPERVISEE_FILE, superviseeId: 30, period: '2026-11' },
      supervisor,
    );
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        superviseeId: 30,
        reviewerId: 20,
        status: ReviewStatus.DRAFT,
        period: '2026-11',
      }),
    );
  });

  it('rejects unknown items, invalid statuses and bad periods', async () => {
    const { service } = makeService(review());
    await expect(
      service.create(
        {
          type: ReviewType.SUPERVISEE_FILE,
          superviseeId: 30,
          items: { nope: ItemStatus.COMPLETE },
        },
        supervisor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create(
        {
          type: ReviewType.SUPERVISEE_FILE,
          superviseeId: 30,
          items: { evaluations: 'X' },
        },
        supervisor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create(
        {
          type: ReviewType.SUPERVISEE_FILE,
          superviseeId: 30,
          period: '2026-13',
        },
        supervisor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not let a supervisor review themselves', async () => {
    const { service } = makeService(review(), {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 20, role: { name: Role.SUPERVISOR } }),
    });
    await expect(
      service.create(
        { type: ReviewType.SUPERVISEE_FILE, superviseeId: 20 },
        supervisor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses to sign while items are missing, then signs when complete', async () => {
    const incomplete = makeService(review());
    await expect(incomplete.service.sign(5, supervisor)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    const items = Object.fromEntries(
      itemKeys(ReviewType.SUPERVISEE_FILE).map((key) => [
        key,
        ItemStatus.COMPLETE,
      ]),
    );
    const complete = makeService(review({ items }));
    await complete.service.sign(5, supervisor);
    expect(complete.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: ReviewStatus.SIGNED }),
    );
  });

  it('keeps a signed review immutable', async () => {
    const { service, save } = makeService(
      review({ status: ReviewStatus.SIGNED }),
    );
    await expect(
      service.update(5, { recommendations: 'x' }, supervisor),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(save).not.toHaveBeenCalled();
  });

  it('only the author or ADMIN can edit; other supervisors cannot even read it', async () => {
    const { service } = makeService(review());
    await expect(
      service.findOne(5, user(21, Role.SUPERVISOR)),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.update(5, { recommendations: 'x' }, admin),
    ).resolves.toBeDefined();
  });

  it('limits ADMIN_COUNTRY to their own country', async () => {
    const { service } = makeService(review());
    await expect(service.findOne(5, countryAdmin)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('does not search with fewer than two characters', async () => {
    const { service } = makeService(review());
    await expect(service.searchCases(supervisor, 'a')).resolves.toEqual([]);
  });
});
