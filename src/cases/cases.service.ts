import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { PhysicalHealthHistory } from '../participants/entities/physical-health-history.entity';
import { MentalHealthHistory } from '../participants/entities/mental-health-history.entity';
import { FamilyHealthHistory } from '../participants/entities/family-health-history.entity';
import { InterventionPlan } from '../participants/entities/intervention-plan.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { ClosingNote } from '../participants/entities/closing-note.entity';
import { ParticipantIdentifiedSituation } from '../participants/entities/participant-identified-situation.entity';
import { IdentifiedSituation } from '../identified-situations/entities/identified-situation.entity';
import { FollowUpPlan } from '../participants/entities/follow-up-plan.entity';
import { Weighing } from '../participants/entities/weighing.entity';
import { FamilyMember } from '../participants/entities/family-member.entity';
import { BioPsychosocialHistory } from '../participants/entities/bio-psychosocial-history.entity';
import {
  CreateCaseDto,
  UpdateCaseDto,
  UpdateCaseStatusDto,
} from './dto/case.dto';
import { CaseStatus } from '../common/enums';

@Injectable()
export class CasesService {
  private readonly logger = new Logger(CasesService.name);

  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea un nuevo caso con toda su información médica y familiar asociada
   * @param createCaseDto - DTO con los datos del caso a crear
   * @returns Promise<Case> - Caso creado con todas sus relaciones
   * @throws NotFoundException - Si el participante no existe
   * @throws BadRequestException - Si hay errores de validación
   */
  async createCase(
    createCaseDto: CreateCaseDto,
    createdById?: number,
  ): Promise<Case> {
    this.logger.log(
      `Iniciando creación de caso para participante ID: ${createCaseDto.participantId}`,
    );

    // Validar que el participante existe
    const participant = await this.participantRepository.findOne({
      where: { id: createCaseDto.participantId },
    });

    if (!participant) {
      this.logger.error(
        `Participante no encontrado: ${createCaseDto.participantId}`,
      );
      throw new NotFoundException(
        `Participante con ID ${createCaseDto.participantId} no encontrado`,
      );
    }

    // Usar transacción para garantizar atomicidad
    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Generar número de caso único
        const caseNumber = await this.generateCaseNumber();
        this.logger.debug(`Número de caso generado: ${caseNumber}`);

        // 2. Crear el caso principal
        const newCase = manager.create(Case, {
          caseNumber,
          participantId: createCaseDto.participantId,
          status: CaseStatus.OPEN,
          consultationReason: createCaseDto.consultationReason,
          intervention: createCaseDto.intervention,
          referrals: createCaseDto.referrals,
          createdById,
        });

        const savedCase = await manager.save(newCase);
        this.logger.debug(`Caso creado con ID: ${savedCase.id}`);

        // ============================================================================
        // INFORMACIÓN FAMILIAR Y BIOPSICOSOCIAL (ahora del caso)
        // ============================================================================

        // 3. Crear miembros familiares si se proporcionan
        if (createCaseDto.familyMembers?.length) {
          this.logger.debug(
            `Creando ${createCaseDto.familyMembers.length} miembros familiares`,
          );

          const familyMemberEntities = createCaseDto.familyMembers.map(
            (memberData) =>
              manager.create(FamilyMember, {
                ...memberData,
                caseId: savedCase.id,
              }),
          );

          await manager.save(FamilyMember, familyMemberEntities);
          this.logger.debug('Miembros familiares creados exitosamente');
        }

        // 4. Crear historial biopsicosocial si se proporciona
        if (createCaseDto.bioPsychosocialHistory) {
          this.logger.debug('Creando historial biopsicosocial');

          // Verificar si ya existe un historial para este caso
          const existingHistory = await manager.findOne(
            BioPsychosocialHistory,
            {
              where: { caseId: savedCase.id },
            },
          );

          if (existingHistory) {
            this.logger.warn(
              `Ya existe historial biopsicosocial para caso ${savedCase.id}. Se actualizará.`,
            );

            // Actualizar el historial existente
            await manager.update(
              BioPsychosocialHistory,
              { caseId: savedCase.id },
              createCaseDto.bioPsychosocialHistory,
            );
          } else {
            // Crear nuevo historial
            const bioPsychosocialHistory = manager.create(
              BioPsychosocialHistory,
              {
                ...createCaseDto.bioPsychosocialHistory,
                caseId: savedCase.id,
              },
            );

            await manager.save(bioPsychosocialHistory);
            this.logger.debug('Historial biopsicosocial creado exitosamente');
          }
        }

        // ============================================================================
        // INFORMACIÓN MÉDICA DEL CASO
        // ============================================================================

        // 5. Crear planes de seguimiento
        if (createCaseDto.followUpPlan?.length) {
          this.logger.debug(
            `Creando ${createCaseDto.followUpPlan.length} planes de seguimiento`,
          );

          const followUpPlans = createCaseDto.followUpPlan.map(
            (followUpPlanData) =>
              manager.create(FollowUpPlan, {
                ...followUpPlanData,
                caseId: savedCase.id,
              }),
          );

          await manager.save(FollowUpPlan, followUpPlans);
        }

        // 6. Crear historiales de salud física
        if (createCaseDto.physicalHealthHistory?.length) {
          this.logger.debug(
            `Creando ${createCaseDto.physicalHealthHistory.length} historiales de salud física`,
          );

          const physicalHealthHistories =
            createCaseDto.physicalHealthHistory.map((historyData) =>
              manager.create(PhysicalHealthHistory, {
                ...historyData,
                caseId: savedCase.id,
              }),
            );

          await manager.save(PhysicalHealthHistory, physicalHealthHistories);
        }

        // 7. Crear historiales de salud mental
        if (createCaseDto.mentalHealthHistory?.length) {
          this.logger.debug(
            `Creando ${createCaseDto.mentalHealthHistory.length} historiales de salud mental`,
          );

          const mentalHealthHistories = createCaseDto.mentalHealthHistory.map(
            (historyData) =>
              manager.create(MentalHealthHistory, {
                ...historyData,
                caseId: savedCase.id,
              }),
          );

          await manager.save(MentalHealthHistory, mentalHealthHistories);
        }

        // 7b. Crear antecedentes familiares de salud
        if (createCaseDto.family_health_history?.length) {
          this.logger.debug(
            `Creando ${createCaseDto.family_health_history.length} antecedentes familiares de salud`,
          );

          const familyHealthHistories = createCaseDto.family_health_history.map(
            (item) =>
              manager.create(FamilyHealthHistory, {
                caseId: savedCase.id,
                historyType: item.history_type,
                familyHistoryFather: item.familyHistoryFather,
                familyHistoryMother: item.familyHistoryMother,
              }),
          );

          await manager.save(FamilyHealthHistory, familyHealthHistories);
          this.logger.debug('Antecedentes familiares de salud creados');
        }

        // 8. Crear ponderación (weighing)
        if (createCaseDto.weighing) {
          this.logger.debug('Creando ponderación del caso');

          const weighing = manager.create(Weighing, {
            ...createCaseDto.weighing,
            caseId: savedCase.id,
          });

          await manager.save(weighing);
        }

        // 9. Crear planes de intervención
        if (createCaseDto.interventionPlans?.length) {
          this.logger.debug(
            `Creando ${createCaseDto.interventionPlans.length} planes de intervención`,
          );

          const interventionPlans = createCaseDto.interventionPlans.map(
            (planData) =>
              manager.create(InterventionPlan, {
                ...planData,
                caseId: savedCase.id,
              }),
          );

          await manager.save(InterventionPlan, interventionPlans);
        }

        // 10. Crear notas de progreso
        if (createCaseDto.progressNotes?.length) {
          this.logger.debug(
            `Creando ${createCaseDto.progressNotes.length} notas de progreso`,
          );

          const progressNotes = createCaseDto.progressNotes.map((noteData) =>
            manager.create(ProgressNote, {
              sessionDate: new Date(noteData.sessionDate),
              sessionType: noteData.sessionType,
              summary: noteData.summary,
              observations: noteData.observations,
              agreements: noteData.agreements,
              caseId: savedCase.id,
            }),
          );

          await manager.save(ProgressNote, progressNotes);
        }

        // 11. Crear situaciones identificadas
        if (createCaseDto.identifiedSituations?.length) {
          this.logger.debug(
            `Procesando ${createCaseDto.identifiedSituations.length} situaciones identificadas`,
          );

          const validSituations = await this.createIdentifiedSituations(
            manager,
            savedCase.id,
            createCaseDto.identifiedSituations,
          );

          this.logger.debug(
            `${validSituations} situaciones identificadas creadas`,
          );
        }

        // 12. Crear nota de cierre
        if (createCaseDto.closingNote) {
          this.logger.debug('Creando nota de cierre del caso');

          const closingNote = manager.create(ClosingNote, {
            closingDate: createCaseDto.closingNote.closingDate
              ? new Date(createCaseDto.closingNote.closingDate)
              : undefined,
            reason: createCaseDto.closingNote.reason,
            achievements: createCaseDto.closingNote.achievements,
            recommendations: createCaseDto.closingNote.recommendations,
            observations: createCaseDto.closingNote.observations,
            caseId: savedCase.id,
          });

          await manager.save(closingNote);
        }

        // Retornar el caso completo con todas las relaciones
        const completeCase = await this.findCaseWithRelations(
          manager,
          savedCase.id,
        );

        this.logger.log(
          `Caso ${caseNumber} creado exitosamente con ID: ${savedCase.id}`,
        );

        return completeCase;
      } catch (error) {
        this.logger.error(
          `Error al crear caso para participante ${createCaseDto.participantId}`,
          error,
        );
        throw error;
      }
    });
  }

  /**
   * Método auxiliar para crear situaciones identificadas
   */
  private async createIdentifiedSituations(
    manager: import('typeorm').EntityManager,
    caseId: number,
    situationIds: number[],
  ): Promise<number> {
    const situationPromises = situationIds.map(async (situationId) => {
      const identifiedSituation = await manager.findOne(IdentifiedSituation, {
        where: { id: situationId, isActive: true },
      });

      if (identifiedSituation) {
        return manager.create(ParticipantIdentifiedSituation, {
          caseId,
          identifiedSituationId: identifiedSituation.id,
        });
      }

      this.logger.warn(`Situación identificada ${situationId} no encontrada`);
      return null;
    });

    const resolvedSituations = await Promise.all(situationPromises);
    const validSituations = resolvedSituations.filter(
      (situation): situation is ParticipantIdentifiedSituation =>
        situation !== null,
    );

    if (validSituations.length > 0) {
      await manager.save(ParticipantIdentifiedSituation, validSituations);
    }

    return validSituations.length;
  }

  /**
   * Método auxiliar para obtener caso con todas sus relaciones
   */
  private async findCaseWithRelations(
    manager: import('typeorm').EntityManager,
    caseId: number,
  ): Promise<Case> {
    const completeCase = await manager.findOne(Case, {
      where: { id: caseId },
      relations: [
        'participant',
        'participant.documentType',
        'participant.gender',
        'participant.maritalStatus',
        'participant.healthInsurance',
        'participant.registeredBy',
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
      ],
    });

    if (!completeCase) {
      throw new NotFoundException('Error al recuperar el caso creado');
    }

    return completeCase;
  }

  async findAllByParticipant(participantId: number): Promise<Case[]> {
    // Verificar que el participante existe
    const participant = await this.participantRepository.findOne({
      where: { id: participantId },
    });

    if (!participant) {
      throw new NotFoundException(
        `Participante con ID ${participantId} no encontrado`,
      );
    }

    return await this.caseRepository.find({
      where: { participantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(caseId: number): Promise<Case> {
    const caseEntity = await this.caseRepository.findOne({
      where: { id: caseId },
      relations: [
        'participant',
        'participant.documentType',
        'participant.gender',
        'participant.maritalStatus',
        'participant.healthInsurance',
        'participant.registeredBy',
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
      ],
    });

    if (!caseEntity) {
      throw new NotFoundException(`Caso con ID ${caseId} no encontrado`);
    }

    return caseEntity;
  }

  async updateCase(
    caseId: number,
    updateCaseDto: UpdateCaseDto,
  ): Promise<Case> {
    // Verificar que el caso existe
    await this.findOne(caseId);

    // Actualizar campos escalares directamente (evita cascade en relaciones cargadas)
    const scalarFields: Partial<Case> = {};
    if (updateCaseDto.consultationReason !== undefined) {
      scalarFields.consultationReason =
        updateCaseDto.consultationReason as string;
    }
    if (updateCaseDto.intervention !== undefined) {
      scalarFields.intervention = updateCaseDto.intervention as string;
    }
    if (updateCaseDto.referrals !== undefined) {
      scalarFields.referrals = updateCaseDto.referrals as string;
    }

    if (Object.keys(scalarFields).length > 0) {
      await this.caseRepository.update(caseId, scalarFields);
    }

    if (updateCaseDto.followUpPlan?.length) {
      const followUpPlanRepo = this.dataSource.getRepository(FollowUpPlan);
      await followUpPlanRepo.delete({ caseId });
      const newPlans = updateCaseDto.followUpPlan.map((planData) =>
        followUpPlanRepo.create({ ...planData, caseId: caseId }),
      );
      await followUpPlanRepo.save(newPlans);
    }

    if (updateCaseDto.physicalHealthHistory !== undefined) {
      const physRepo = this.dataSource.getRepository(PhysicalHealthHistory);
      await physRepo.delete({ caseId });
      if (updateCaseDto.physicalHealthHistory.length) {
        const newRecords = updateCaseDto.physicalHealthHistory.map((item) =>
          physRepo.create({ ...item, caseId }),
        );
        await physRepo.save(newRecords);
      }
    }

    if (updateCaseDto.mentalHealthHistory !== undefined) {
      const mentalRepo = this.dataSource.getRepository(MentalHealthHistory);
      await mentalRepo.delete({ caseId });
      if (updateCaseDto.mentalHealthHistory.length) {
        const newRecords = updateCaseDto.mentalHealthHistory.map((item) =>
          mentalRepo.create({ ...item, caseId }),
        );
        await mentalRepo.save(newRecords);
      }
    }

    if (updateCaseDto.family_health_history?.length) {
      const familyRepo = this.dataSource.getRepository(FamilyHealthHistory);
      // Borrar solo los del mismo history_type que se está actualizando
      const historyTypes = [
        ...new Set(
          updateCaseDto.family_health_history.map((i) => i.history_type),
        ),
      ];
      for (const historyType of historyTypes) {
        await familyRepo.delete({ caseId, historyType });
      }
      const newRecords = updateCaseDto.family_health_history.map((item) =>
        familyRepo.create({
          caseId,
          historyType: item.history_type,
          familyHistoryFather: item.familyHistoryFather,
          familyHistoryMother: item.familyHistoryMother,
        }),
      );
      await familyRepo.save(newRecords);
    }

    if (updateCaseDto.weighing) {
      const weighingRepo = this.dataSource.getRepository(Weighing);
      const existing = await weighingRepo.findOne({ where: { caseId } });
      if (existing) {
        await weighingRepo.update(existing.id, updateCaseDto.weighing);
      } else {
        await weighingRepo.save(
          weighingRepo.create({ ...updateCaseDto.weighing, caseId }),
        );
      }
    }

    if (updateCaseDto.interventionPlans?.length) {
      const interventionRepo = this.dataSource.getRepository(InterventionPlan);
      await interventionRepo.delete({ caseId });
      const newPlans = updateCaseDto.interventionPlans.map((plan) =>
        interventionRepo.create({ ...plan, caseId }),
      );
      await interventionRepo.save(newPlans);
    }

    if (updateCaseDto.progressNotes?.length) {
      const progressRepo = this.dataSource.getRepository(ProgressNote);
      await progressRepo.delete({ caseId });
      const newNotes = updateCaseDto.progressNotes.map((note) =>
        progressRepo.create({ ...note, caseId }),
      );
      await progressRepo.save(newNotes);
    }

    if (updateCaseDto.closingNote) {
      const closingRepo = this.dataSource.getRepository(ClosingNote);
      const existing = await closingRepo.findOne({ where: { caseId } });
      if (existing) {
        await closingRepo.update(existing.id, updateCaseDto.closingNote);
      } else {
        await closingRepo.save(
          closingRepo.create({ ...updateCaseDto.closingNote, caseId }),
        );
      }
    }

    if (updateCaseDto.bioPsychosocialHistory) {
      const bioRepo = this.dataSource.getRepository(BioPsychosocialHistory);
      const existing = await bioRepo.findOne({ where: { caseId } });
      if (existing) {
        await bioRepo.update(existing.id, updateCaseDto.bioPsychosocialHistory);
      } else {
        await bioRepo.save(
          bioRepo.create({ ...updateCaseDto.bioPsychosocialHistory, caseId }),
        );
      }
    }

    if (updateCaseDto.familyMembers !== undefined) {
      const familyMemberRepo = this.dataSource.getRepository(FamilyMember);
      await familyMemberRepo.delete({ caseId });
      if (updateCaseDto.familyMembers.length) {
        const newMembers = updateCaseDto.familyMembers.map((member) =>
          familyMemberRepo.create({ ...member, caseId }),
        );
        await familyMemberRepo.save(newMembers);
      }
    }

    return await this.findOne(caseId);
  }

  async updateStatus(
    caseId: number,
    updateCaseStatusDto: UpdateCaseStatusDto,
  ): Promise<Case> {
    const caseEntity = await this.findOne(caseId);

    // Validar transiciones de estado válidas
    this.validateStatusTransition(
      caseEntity.status,
      updateCaseStatusDto.status,
    );

    caseEntity.status = updateCaseStatusDto.status;
    return await this.caseRepository.save(caseEntity);
  }

  private async generateCaseNumber(): Promise<string> {
    // Obtener el conteo total de casos para generar el número secuencial
    const totalCases = await this.caseRepository.count();
    const nextNumber = totalCases + 1;

    // Formatear con ceros a la izquierda (ej: CASE-0001)
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    const caseNumber = `CASE-${formattedNumber}`;

    // Verificar que el número no existe (por si acaso)
    const existingCase = await this.caseRepository.findOne({
      where: { caseNumber },
    });

    if (existingCase) {
      // Si existe, intentar con el siguiente número
      return this.generateCaseNumber();
    }

    return caseNumber;
  }

  private validateStatusTransition(
    currentStatus: CaseStatus,
    newStatus: CaseStatus,
  ): void {
    const validTransitions: Record<CaseStatus, CaseStatus[]> = {
      [CaseStatus.OPEN]: [CaseStatus.IN_PROGRESS, CaseStatus.CLOSED],
      [CaseStatus.IN_PROGRESS]: [CaseStatus.OPEN, CaseStatus.CLOSED],
      [CaseStatus.CLOSED]: [CaseStatus.OPEN, CaseStatus.IN_PROGRESS],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Transición de estado inválida: ${currentStatus} -> ${newStatus}`,
      );
    }
  }

  async findAll(): Promise<Case[]> {
    return await this.caseRepository.find({
      relations: ['participant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findCasesByUser(userId: number): Promise<{
    userId: number;
    total: number;
    cases: Array<{
      id: number;
      caseNumber: string;
      status: CaseStatus;
      consultationReason?: string;
      intervention?: string;
      createdAt: Date;
      updatedAt: Date;
      participant: {
        id: number;
        fullName: string;
        documentNumber: string;
      };
    }>;
  }> {
    const cases = await this.caseRepository
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.participant', 'participant')
      .where('case.createdById = :userId', { userId })
      .orderBy('case.createdAt', 'DESC')
      .getMany();

    return {
      userId,
      total: cases.length,
      cases: cases.map((caseEntity) => ({
        id: caseEntity.id,
        caseNumber: caseEntity.caseNumber,
        status: caseEntity.status,
        consultationReason: caseEntity.consultationReason,
        intervention: caseEntity.intervention,
        createdAt: caseEntity.createdAt,
        updatedAt: caseEntity.updatedAt,
        participant: {
          id: caseEntity.participant.id,
          fullName:
            `${caseEntity.participant.firstName} ${caseEntity.participant.secondName || ''} ${caseEntity.participant.firstLastName} ${caseEntity.participant.secondLastName || ''}`.trim(),
          documentNumber: caseEntity.participant.documentNumber,
        },
      })),
    };
  }
}
