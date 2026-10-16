import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, EntityManager, In } from 'typeorm';
import { CaseStatus, Role } from '../common/enums';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { User } from '../users/entities/user.entity';
import { CaseDiscussion } from '../case-discussions/entities/case-discussion.entity';
import { CaseDocumentHistory } from './entities/case-document-history.entity';

export type CaseDocumentKind =
  | 'full'
  | 'progress'
  | 'intervention'
  | 'completion'
  | 'closing'
  | 'discussion';

// Only public professional identity belongs in a clinical document snapshot.
export function historicalUser(user?: User | null): User | undefined {
  if (!user) return undefined;
  return Object.assign(new User(), {
    id: user.id,
    firstName: user.firstName,
    secondName: user.secondName,
    firstLastName: user.firstLastName,
    secondLastName: user.secondLastName,
    email: user.email,
    position: user.position,
  });
}

export function ageAt(birthDate: Date | string, reference: Date): number {
  const birth = new Date(birthDate);
  let age = reference.getUTCFullYear() - birth.getUTCFullYear();
  if (
    reference.getUTCMonth() < birth.getUTCMonth() ||
    (reference.getUTCMonth() === birth.getUTCMonth() &&
      reference.getUTCDate() < birth.getUTCDate())
  )
    age--;
  return age;
}

@Injectable()
export class CaseDocumentHistoryService {
  private readonly logger = new Logger(CaseDocumentHistoryService.name);
  constructor(private readonly dataSource: DataSource) {}

  async lockCase(manager: EntityManager, caseId: number): Promise<Case> {
    const entity = await manager.findOne(Case, {
      where: { id: caseId },
      loadEagerRelations: false,
      lock: { mode: 'pessimistic_write' },
    });
    if (!entity) throw new NotFoundException('Caso no encontrado');
    return entity;
  }

  assertOpen(entity: Case): void {
    if (entity.status === CaseStatus.CLOSED) {
      throw new ConflictException(
        'El expediente cerrado es inmutable. Registre un nuevo caso para continuar la atención.',
      );
    }
  }

  async loadCase(
    manager: EntityManager,
    caseId: number,
    includeParticipant = true,
    kind: CaseDocumentKind = 'full',
  ): Promise<Case> {
    const entity = await manager.findOne(Case, {
      where: { id: caseId },
      relationLoadStrategy: 'query',
      loadEagerRelations: false,
      relations:
        kind === 'full'
          ? [
              'familyMembers',
              'familyMembers.familyRelationship',
              'familyMembers.academicLevel',
              'bioPsychosocialHistory',
              'bioPsychosocialHistory.academicLevel',
              'bioPsychosocialHistory.incomeSource',
              'bioPsychosocialHistory.incomeLevel',
              'bioPsychosocialHistory.housingType',
              'followUpPlans',
              'physicalHealthHistories',
              'mentalHealthHistories',
              'familyHealthHistories',
              'weighing',
              'interventionPlans',
              'progressNotes',
              'progressNotes.approachType',
              'progressNotes.processType',
              'closingNote',
              'participantIdentifiedSituations',
              'participantIdentifiedSituations.identifiedSituation',
            ]
          : {
              progress: [
                'progressNotes',
                'progressNotes.approachType',
                'progressNotes.processType',
              ],
              intervention: ['interventionPlans'],
              completion: ['followUpPlans'],
              closing: ['closingNote'],
              discussion: [],
            }[kind],
    });
    if (!entity) throw new NotFoundException('Caso no encontrado');
    if (includeParticipant) {
      const participant = await manager.findOne(Participant, {
        where: { id: entity.participantId },
        withDeleted: true,
        relationLoadStrategy: 'query',
        loadEagerRelations: false,
        relations: [
          'documentType',
          'gender',
          'maritalStatus',
          'healthInsurance',
          'country',
        ],
      });
      if (!participant)
        throw new ConflictException(
          'No existe el participante del expediente histórico',
        );
      entity.participant = participant;
    }
    for (const records of [
      entity.familyMembers,
      entity.progressNotes,
      entity.interventionPlans,
      entity.followUpPlans,
      entity.physicalHealthHistories,
      entity.mentalHealthHistories,
      entity.familyHealthHistories,
      entity.participantIdentifiedSituations,
    ])
      records?.sort((a, b) => a.id - b.id);
    const users = await this.loadUsers(manager, [
      entity.createdById,
      entity.assignedToId,
      entity.participant?.registeredById,
    ]);
    entity.createdBy = users.get(entity.createdById ?? 0);
    entity.assignedTo = users.get(entity.assignedToId ?? 0);
    if (entity.participant) {
      entity.participant = Object.assign(
        new Participant(),
        entity.participant,
        {
          registeredBy: users.get(entity.participant.registeredById),
        },
      );
    }
    return entity;
  }

  async captureOpening(
    manager: EntityManager,
    entity: Case,
    source: 'creation' | 'legacy' = 'creation',
  ): Promise<CaseDocumentHistory> {
    if (!entity.participant) {
      throw new ConflictException(
        'No existe información del participante para crear el histórico',
      );
    }
    const capturedAt = new Date();
    const history = manager.create(CaseDocumentHistory, {
      caseId: entity.id,
      countryId: entity.participant.countryId,
      source,
      capturedAt,
      participantSnapshot: entity.participant,
      participantAge: ageAt(
        entity.participant.birthDate,
        source === 'creation' ? new Date(entity.createdAt) : capturedAt,
      ),
      familySnapshot: entity.familyMembers ?? [],
      responsibleSnapshot: historicalUser(
        entity.assignedTo ?? entity.createdBy,
      ),
    });
    return this.saveHistory(manager, history);
  }

  async freeze(
    manager: EntityManager,
    entity: Case,
    closedBy?: User,
  ): Promise<void> {
    const history = await this.requireHistory(manager, entity.id);
    if (history.closedSnapshot)
      throw new ConflictException('El caso ya tiene un cierre histórico');
    history.closedAt = new Date();
    history.closedBySnapshot = historicalUser(closedBy);
    history.closedSnapshot = this.applyOpening(entity, history);
    history.closedSnapshot.documentDate = history.closedAt;
    history.closedSnapshot.documentClosedBy = history.closedBySnapshot;
    history.discussionsSnapshot = await this.loadDiscussions(
      manager,
      entity.id,
    );
    await this.saveHistory(manager, history);
  }

  async refreshFamily(manager: EntityManager, entity: Case): Promise<void> {
    this.assertOpen(entity);
    const history = await this.requireHistory(manager, entity.id);
    history.familySnapshot = entity.familyMembers ?? [];
    await this.saveHistory(manager, history);
  }

  private async saveHistory(
    manager: EntityManager,
    history: CaseDocumentHistory,
  ): Promise<CaseDocumentHistory> {
    try {
      return await manager.save(history);
    } catch {
      this.logger.error(
        `No se pudo guardar el histórico del caso ${history.caseId}`,
      );
      throw new InternalServerErrorException(
        'No se pudo conservar el histórico; la operación fue revertida.',
      );
    }
  }

  private async loadUsers(
    manager: EntityManager,
    ids: (number | undefined)[],
  ): Promise<Map<number, User>> {
    const unique = [...new Set(ids.filter((id): id is number => id != null))];
    if (!unique.length) return new Map();
    const users = await manager.find(User, {
      where: { id: In(unique) },
      loadEagerRelations: false,
      select: {
        id: true,
        firstName: true,
        secondName: true,
        firstLastName: true,
        secondLastName: true,
        email: true,
        position: true,
      },
    });
    return new Map(users.map((user) => [Number(user.id), user]));
  }

  async loadDiscussions(
    manager: EntityManager,
    caseId: number,
    discussionId?: number,
  ): Promise<CaseDiscussion[]> {
    const discussions = await manager.find(CaseDiscussion, {
      where: {
        caseId,
        ...(discussionId === undefined ? {} : { id: discussionId }),
      },
      relationLoadStrategy: 'query',
      relations: ['familyMembers'],
      order: { id: 'ASC' },
    });
    const users = await this.loadUsers(
      manager,
      discussions.flatMap((d) => [
        d.socialWorkerId,
        d.supervisorId,
        d.finalizedById,
        d.annulledById,
      ]),
    );
    for (const discussion of discussions) {
      discussion.familyMembers?.sort(
        (a, b) => a.sortOrder - b.sortOrder || Number(a.id) - Number(b.id),
      );
      const worker = users.get(Number(discussion.socialWorkerId));
      const supervisor = users.get(Number(discussion.supervisorId));
      if (!worker || !supervisor)
        throw new ConflictException(
          'No existe la identidad de los responsables de la discusión',
        );
      discussion.socialWorker = worker;
      discussion.supervisor = supervisor;
      discussion.finalizedBy = users.get(Number(discussion.finalizedById));
      discussion.annulledBy = users.get(Number(discussion.annulledById));
    }
    return discussions;
  }

  private async requireHistory(
    manager: EntityManager,
    caseId: number,
  ): Promise<CaseDocumentHistory> {
    const history = await manager.findOneBy(CaseDocumentHistory, { caseId });
    if (!history) {
      throw new ConflictException(
        'El caso no tiene histórico. Ejecute la migración de expedientes antes de descargar documentos o cerrar el caso.',
      );
    }
    return history;
  }

  async getOpeningHistory(
    manager: EntityManager,
    caseId: number,
  ): Promise<CaseDocumentHistory> {
    return this.requireHistory(manager, caseId);
  }

  private applyOpening(entity: Case, history: CaseDocumentHistory): Case {
    return Object.assign(new Case(), entity, {
      participant: history.participantSnapshot,
      participantAge: history.participantAge,
      familyMembers: history.familySnapshot,
      createdBy: history.responsibleSnapshot,
      documentDate: new Date(entity.updatedAt ?? history.capturedAt),
    });
  }

  async getDocumentCase(
    caseId: number,
    user: User,
    kind: CaseDocumentKind = 'full',
  ): Promise<Case> {
    const { entity } = await this.getDocumentContext(
      caseId,
      user,
      undefined,
      kind,
    );
    return entity;
  }

  async getDocumentContext(
    caseId: number,
    user: User,
    discussionId?: number,
    kind: CaseDocumentKind = 'full',
  ): Promise<{
    entity: Case;
    discussions: CaseDiscussion[];
  }> {
    return this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      const caseEntity = await manager.findOne(Case, {
        where: { id: caseId },
        loadEagerRelations: false,
        select: { id: true, createdById: true, status: true },
      });
      if (!caseEntity) throw new NotFoundException('Caso no encontrado');
      const scope = await manager.findOne(CaseDocumentHistory, {
        where: { caseId },
        select: { caseId: true, countryId: true },
      });
      this.assertCanDownload(caseEntity, scope?.countryId, user);
      const history = await this.requireHistory(manager, caseId);
      if (caseEntity.status === CaseStatus.CLOSED) {
        if (!history.closedSnapshot)
          throw new ConflictException(
            'El caso cerrado no tiene snapshot de cierre',
          );
        return {
          entity: history.closedSnapshot,
          discussions: history.discussionsSnapshot ?? [],
        };
      }
      return {
        entity: this.applyOpening(
          await this.loadCase(
            manager,
            caseId,
            false,
            discussionId === undefined ? kind : 'discussion',
          ),
          history,
        ),
        discussions:
          discussionId === undefined
            ? []
            : await this.loadDiscussions(manager, caseId, discussionId),
      };
    });
  }

  assertCanDownload(
    entity: Case,
    countryId: number | undefined,
    user: User,
  ): void {
    const role = user?.role?.name;
    if (role === Role.ADMIN) return;
    if (
      role === Role.ADMIN_COUNTRY &&
      countryId != null &&
      user.countryId != null &&
      Number(countryId) === Number(user.countryId)
    )
      return;
    if (
      role === Role.TRABAJO_SOCIAL &&
      entity.createdById != null &&
      Number(entity.createdById) === Number(user.id)
    )
      return;
    throw new ForbiddenException(
      'No tiene permiso para descargar documentos de este caso',
    );
  }
}
