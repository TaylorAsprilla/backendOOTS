import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';
import { ParticipantAuditLog } from './entities/participant-audit-log.entity';

describe('AuditService participant history', () => {
  it('filters by participant and returns deterministic paginated history', async () => {
    const data = [{ id: 3, participantId: 21 }] as ParticipantAuditLog[];
    const findAndCount = jest.fn().mockResolvedValue([data, 5]);
    const service = new AuditService(
      {} as Repository<AuditLog>,
      { findAndCount } as unknown as Repository<ParticipantAuditLog>,
    );

    await expect(service.findParticipantHistory(21, 2, 2)).resolves.toEqual({
      data,
      total: 5,
      page: 2,
      limit: 2,
      totalPages: 3,
    });
    expect(findAndCount).toHaveBeenCalledWith({
      where: { participantId: 21 },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: 2,
      take: 2,
    });
  });
});
