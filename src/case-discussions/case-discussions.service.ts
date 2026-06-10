import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { FamilyMember } from '../participants/entities/family-member.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums';
import { CreateCaseDiscussionDto } from './dto/create-case-discussion.dto';
import { UpdateCaseDiscussionDto } from './dto/update-case-discussion.dto';
import { FinalizeCaseDiscussionDto } from './dto/finalize-case-discussion.dto';
import { AnnulCaseDiscussionDto } from './dto/annul-case-discussion.dto';
import { QueryCaseDiscussionDto } from './dto/query-case-discussion.dto';
import { CaseDiscussionStatus } from './enums/case-discussion-status.enum';
import { CaseDiscussion } from './entities/case-discussion.entity';
import { CaseDiscussionFamilyMember } from './entities/case-discussion-family-member.entity';
import { CaseDiscussionsPdfService } from './case-discussions-pdf.service';
import { CaseDiscussionFamilyMemberDto } from './dto/case-discussion-family-member.dto';

type PersistedFamilyMember = Pick<
  CaseDiscussionFamilyMember,
  'name' | 'age' | 'relationship' | 'occupation' | 'sortOrder'
>;

@Injectable()
export class CaseDiscussionsService {
  constructor(
    @InjectRepository(CaseDiscussion)
    private readonly caseDiscussionRepository: Repository<CaseDiscussion>,
    @InjectRepository(CaseDiscussionFamilyMember)
    private readonly caseDiscussionFamilyMemberRepository: Repository<CaseDiscussionFamilyMember>,
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FamilyMember)
    private readonly familyMemberRepository: Repository<FamilyMember>,
    private readonly caseDiscussionsPdfService: CaseDiscussionsPdfService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    caseId: number,
    dto: CreateCaseDiscussionDto,
    currentUser: User,
  ): Promise<CaseDiscussion> {
    const caseEntity = await this.findCaseOrFail(caseId);
    this.assertParticipantMatchesCase(caseEntity, dto.participantId);
    this.assertCanCreateDiscussion(caseEntity, dto.supervisorId, currentUser);

    const supervisor = await this.validateSupervisor(dto.supervisorId);
    const participant = await this.findParticipantOrFail(caseEntity.participantId);

    if (!caseEntity.createdById) {
      throw new BadRequestException(
        'El caso no tiene trabajador social o manejador asignado',
      );
    }

    const familyMembers = dto.familyMembers?.length
      ? this.mapFamilyMembersFromDto(dto.familyMembers)
      : this.snapshotCaseFamilyMembers(caseEntity.familyMembers ?? []);

    const saved = await this.dataSource.transaction(async (manager) => {
      const entity = manager.create(CaseDiscussion, {
        caseId: caseEntity.id,
        participantId: participant.id,
        socialWorkerId: caseEntity.createdById,
        supervisorId: supervisor.id,
        discussionDate: dto.discussionDate,
        status: CaseDiscussionStatus.BORRADOR,
        clientNameSnapshot: this.getParticipantFullName(participant),
        clientAgeSnapshot: this.calculateAge(participant.birthDate),
        clientGenderSnapshot: participant.gender?.name,
        clientMaritalStatusSnapshot: participant.maritalStatus?.name,
        presentedSituations: dto.presentedSituations,
        affectedPeople: dto.affectedPeople,
        socialWorkerRecommendations: dto.socialWorkerRecommendations,
        supervisorRecommendations: dto.supervisorRecommendations,
        createdById: currentUser.id,
        updatedById: currentUser.id,
        familyMembers: familyMembers.map((familyMember) =>
          manager.create(CaseDiscussionFamilyMember, familyMember),
        ),
      });

      return await manager.save(CaseDiscussion, entity);
    });

    return await this.findOne(caseId, Number(saved.id), currentUser);
  }

  async findAll(
    caseId: number,
    query: QueryCaseDiscussionDto,
    currentUser: User,
  ): Promise<{
    data: CaseDiscussion[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const caseEntity = await this.findCaseOrFail(caseId);
    const isAdmin = this.isAdmin(currentUser);
    const isCaseWorker = this.isCaseWorker(caseEntity, currentUser);

    if (!isAdmin && !isCaseWorker) {
      const hasSupervisorDiscussions = await this.caseDiscussionRepository.exist({
        where: { caseId, supervisorId: currentUser.id },
      });

      if (!hasSupervisorDiscussions) {
        throw new ForbiddenException('Usuario sin permisos');
      }
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;

    const qb = this.caseDiscussionRepository
      .createQueryBuilder('discussion')
      .leftJoinAndSelect('discussion.supervisor', 'supervisor')
      .leftJoinAndSelect('discussion.socialWorker', 'socialWorker')
      .leftJoinAndSelect('discussion.createdBy', 'createdBy')
      .where('discussion.caseId = :caseId', { caseId })
      .orderBy('discussion.discussionDate', 'DESC')
      .addOrderBy('discussion.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      qb.andWhere('discussion.status = :status', { status: query.status });
    }

    if (!isAdmin && !isCaseWorker) {
      qb.andWhere('discussion.supervisorId = :supervisorId', {
        supervisorId: currentUser.id,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(
    caseId: number,
    discussionId: number,
    currentUser: User,
  ): Promise<CaseDiscussion> {
    const discussion = await this.findDiscussionOrFail(caseId, discussionId);
    this.assertCanAccessDiscussion(discussion, currentUser);
    return discussion;
  }

  async update(
    caseId: number,
    discussionId: number,
    dto: UpdateCaseDiscussionDto,
    currentUser: User,
  ): Promise<CaseDiscussion> {
    const discussion = await this.findDiscussionOrFail(caseId, discussionId);
    const access = this.assertCanEditDiscussion(discussion, currentUser);

    if (dto.participantId !== undefined) {
      this.assertParticipantMatchesCase(discussion.case, dto.participantId);
    }

    if (dto.supervisorId !== undefined) {
      await this.validateSupervisor(dto.supervisorId);
    }

    if (access === 'supervisor') {
      this.assertSupervisorOnlyUpdate(dto);
    }

    const merged = this.caseDiscussionRepository.merge(discussion, {
      supervisorId: dto.supervisorId ?? discussion.supervisorId,
      discussionDate: dto.discussionDate ?? discussion.discussionDate,
      presentedSituations: dto.presentedSituations ?? discussion.presentedSituations,
      affectedPeople: dto.affectedPeople ?? discussion.affectedPeople,
      socialWorkerRecommendations:
        dto.socialWorkerRecommendations ?? discussion.socialWorkerRecommendations,
      supervisorRecommendations:
        dto.supervisorRecommendations ?? discussion.supervisorRecommendations,
      updatedById: currentUser.id,
    });

    await this.dataSource.transaction(async (manager) => {
      await manager.save(CaseDiscussion, merged);

      if (dto.familyMembers) {
        await manager.delete(CaseDiscussionFamilyMember, {
          caseDiscussionId: discussion.id,
        });

        const familyMembers = this.mapFamilyMembersFromDto(dto.familyMembers).map((familyMember) =>
          manager.create(CaseDiscussionFamilyMember, {
            ...familyMember,
            caseDiscussionId: discussion.id,
          }),
        );

        if (familyMembers.length > 0) {
          await manager.save(CaseDiscussionFamilyMember, familyMembers);
        }
      }
    });

    return await this.findOne(caseId, discussionId, currentUser);
  }

  async finalize(
    caseId: number,
    discussionId: number,
    dto: FinalizeCaseDiscussionDto,
    currentUser: User,
  ): Promise<CaseDiscussion> {
    const discussion = await this.findDiscussionOrFail(caseId, discussionId);
    this.assertCanEditDiscussion(discussion, currentUser);

    if (discussion.status === CaseDiscussionStatus.ANULADA) {
      throw new ForbiddenException('La discusión anulada no es editable');
    }

    const socialWorkerRecommendations =
      dto.socialWorkerRecommendations || discussion.socialWorkerRecommendations;
    const supervisorRecommendations =
      dto.supervisorRecommendations || discussion.supervisorRecommendations;

    if (!socialWorkerRecommendations?.trim()) {
      throw new BadRequestException(
        'socialWorkerRecommendations es requerido antes de finalizar',
      );
    }

    if (!supervisorRecommendations?.trim()) {
      throw new BadRequestException(
        'supervisorRecommendations es requerido antes de finalizar',
      );
    }

    discussion.socialWorkerRecommendations = socialWorkerRecommendations;
    discussion.supervisorRecommendations = supervisorRecommendations;
    discussion.affectedPeople = dto.affectedPeople ?? discussion.affectedPeople;
    discussion.status = CaseDiscussionStatus.FINALIZADA;
    discussion.finalizedAt = new Date();
    discussion.finalizedById = currentUser.id;
    discussion.updatedById = currentUser.id;

    await this.caseDiscussionRepository.save(discussion);

    return await this.findOne(caseId, discussionId, currentUser);
  }

  async annul(
    caseId: number,
    discussionId: number,
    dto: AnnulCaseDiscussionDto,
    currentUser: User,
  ): Promise<CaseDiscussion> {
    const discussion = await this.findDiscussionOrFail(caseId, discussionId);
    const isAdmin = this.isAdmin(currentUser);
    this.assertCanAccessDiscussion(discussion, currentUser);

    if (discussion.status === CaseDiscussionStatus.ANULADA) {
      throw new ForbiddenException('La discusión anulada no es editable');
    }

    if (discussion.status === CaseDiscussionStatus.FINALIZADA && !isAdmin) {
      throw new ForbiddenException('La discusión finalizada no es editable');
    }

    discussion.status = CaseDiscussionStatus.ANULADA;
    discussion.annulledAt = new Date();
    discussion.annulledById = currentUser.id;
    discussion.annulmentReason = dto.reason;
    discussion.updatedById = currentUser.id;

    await this.caseDiscussionRepository.save(discussion);

    return await this.findOne(caseId, discussionId, currentUser);
  }

  async generatePdf(
    caseId: number,
    discussionId: number,
    currentUser: User,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const discussion = await this.findOne(caseId, discussionId, currentUser);
    return await this.caseDiscussionsPdfService.generateDiscussionPdf(discussion);
  }

  private async findCaseOrFail(caseId: number): Promise<Case> {
    const caseEntity = await this.caseRepository.findOne({
      where: { id: caseId },
      relations: {
        participant: {
          gender: true,
          maritalStatus: true,
        },
        createdBy: true,
        familyMembers: true,
      },
    });

    if (!caseEntity) {
      throw new NotFoundException('Caso no encontrado');
    }

    if (caseEntity.familyMembers?.length) {
      const familyIds = caseEntity.familyMembers.map((familyMember) => familyMember.id);
      caseEntity.familyMembers = await this.familyMemberRepository.find({
        where: familyIds.map((id) => ({ id })),
        order: { id: 'ASC' },
      });
    }

    return caseEntity;
  }

  private async findParticipantOrFail(participantId: number): Promise<Participant> {
    const participant = await this.participantRepository.findOne({
      where: { id: participantId },
      relations: {
        gender: true,
        maritalStatus: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participante no asociado al caso');
    }

    return participant;
  }

  private async validateSupervisor(supervisorId: number): Promise<User> {
    const supervisor = await this.userRepository.findOne({
      where: { id: supervisorId },
      relations: {
        role: true,
      },
    });

    if (!supervisor) {
      throw new BadRequestException('Supervisor inválido');
    }

    const allowedRoles = [
      Role.SUPERVISOR,
      Role.COORDINADOR,
      Role.ADMIN,
      Role.ADMIN_COUNTRY,
    ];

    if (!supervisor.role?.name || !allowedRoles.includes(supervisor.role.name as Role)) {
      throw new BadRequestException('Supervisor inválido');
    }

    return supervisor;
  }

  private assertParticipantMatchesCase(caseEntity: Case, participantId: number): void {
    if (caseEntity.participantId !== participantId) {
      throw new BadRequestException('Participante no asociado al caso');
    }
  }

  private assertCanCreateDiscussion(
    caseEntity: Case,
    supervisorId: number,
    currentUser: User,
  ): void {
    if (this.isAdmin(currentUser)) {
      return;
    }

    if (this.isCaseWorker(caseEntity, currentUser)) {
      return;
    }

    if (Number(supervisorId) === Number(currentUser.id)) {
      return;
    }

    throw new ForbiddenException('Usuario sin permisos');
  }

  private assertCanAccessDiscussion(
    discussion: CaseDiscussion,
    currentUser: User,
  ): void {
    if (this.isAdmin(currentUser)) {
      return;
    }

    if (this.isCaseWorker(discussion.case, currentUser)) {
      return;
    }

    if (Number(discussion.supervisorId) === Number(currentUser.id)) {
      return;
    }

    throw new ForbiddenException('Usuario sin permisos');
  }

  private assertCanEditDiscussion(
    discussion: CaseDiscussion,
    currentUser: User,
  ): 'admin' | 'worker' | 'supervisor' {
    if (this.isAdmin(currentUser)) {
      return 'admin';
    }

    if (discussion.status === CaseDiscussionStatus.FINALIZADA) {
      throw new ForbiddenException('La discusión finalizada no es editable');
    }

    if (discussion.status === CaseDiscussionStatus.ANULADA) {
      throw new ForbiddenException('La discusión anulada no es editable');
    }

    if (this.isCaseWorker(discussion.case, currentUser)) {
      return 'worker';
    }

    if (Number(discussion.supervisorId) === Number(currentUser.id)) {
      return 'supervisor';
    }

    throw new ForbiddenException('Usuario sin permisos');
  }

  private assertSupervisorOnlyUpdate(dto: UpdateCaseDiscussionDto): void {
    const allowedKeys = ['supervisorRecommendations'];
    const requestedKeys = Object.entries(dto)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key);

    const invalidKey = requestedKeys.find((key) => !allowedKeys.includes(key));
    if (invalidKey) {
      throw new ForbiddenException(
        'El supervisor solo puede agregar o actualizar recomendaciones del supervisor',
      );
    }
  }

  private async findDiscussionOrFail(
    caseId: number,
    discussionId: number,
  ): Promise<CaseDiscussion> {
    const discussion = await this.caseDiscussionRepository.findOne({
      where: { id: discussionId, caseId },
      relations: {
        case: {
          participant: true,
          familyMembers: true,
          createdBy: true,
        },
        participant: {
          gender: true,
          maritalStatus: true,
        },
        socialWorker: true,
        supervisor: true,
        createdBy: true,
        updatedBy: true,
        finalizedBy: true,
        annulledBy: true,
        familyMembers: true,
      },
    });

    if (!discussion) {
      throw new NotFoundException('Discusión no encontrada');
    }

    return discussion;
  }

  private isAdmin(user: User): boolean {
    return [Role.ADMIN, Role.ADMIN_COUNTRY].includes(user.role?.name as Role);
  }

  private isCaseWorker(caseEntity: Case, user: User): boolean {
    return Number(caseEntity.createdById) === Number(user.id);
  }

  private getParticipantFullName(participant: Participant): string {
    return [
      participant.firstName,
      participant.secondName,
      participant.firstLastName,
      participant.secondLastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  private calculateAge(date?: Date): number | undefined {
    if (!date) {
      return undefined;
    }

    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }

    return age;
  }

  private snapshotCaseFamilyMembers(
    familyMembers: FamilyMember[],
  ): PersistedFamilyMember[] {
    return familyMembers.map((familyMember, index) => ({
      name: familyMember.name,
      age: this.calculateAge(familyMember.birthDate),
      relationship:
        familyMember.familyRelationship?.name ||
        String(familyMember.familyRelationshipId),
      occupation: familyMember.occupation,
      sortOrder: index,
    }));
  }

  private mapFamilyMembersFromDto(
    familyMembers: CaseDiscussionFamilyMemberDto[],
  ): PersistedFamilyMember[] {
    return familyMembers.map((familyMember, index) => ({
      name: familyMember.name,
      age: familyMember.age,
      relationship: familyMember.relationship,
      occupation: familyMember.occupation,
      sortOrder: familyMember.sortOrder ?? index,
    }));
  }
}