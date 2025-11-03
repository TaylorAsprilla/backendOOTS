import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { CaseFollowUpPlan } from '../participants/entities/case-follow-up-plan.entity';
import { PhysicalHealthHistory } from '../participants/entities/physical-health-history.entity';
import { MentalHealthHistory } from '../participants/entities/mental-health-history.entity';
import { InterventionPlan } from '../participants/entities/intervention-plan.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { ClosingNote } from '../participants/entities/closing-note.entity';
import { ParticipantIdentifiedSituation } from '../participants/entities/participant-identified-situation.entity';
import { IdentifiedSituation } from '../common/entities';
import { FollowUpPlanCatalog } from '../common/entities/follow-up-plan-catalog.entity';
import { Weighing } from '../participants/entities/weighing.entity';
import { CreateCaseDto, UpdateCaseStatusDto } from './dto/case.dto';
import { CaseStatus } from '../common/enums';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(CaseFollowUpPlan)
    private readonly caseFollowUpPlanRepository: Repository<CaseFollowUpPlan>,
    @InjectRepository(PhysicalHealthHistory)
    private readonly physicalHealthHistoryRepository: Repository<PhysicalHealthHistory>,
    @InjectRepository(MentalHealthHistory)
    private readonly mentalHealthHistoryRepository: Repository<MentalHealthHistory>,
    @InjectRepository(InterventionPlan)
    private readonly interventionPlanRepository: Repository<InterventionPlan>,
    @InjectRepository(ProgressNote)
    private readonly progressNoteRepository: Repository<ProgressNote>,
    @InjectRepository(ClosingNote)
    private readonly closingNoteRepository: Repository<ClosingNote>,
    @InjectRepository(ParticipantIdentifiedSituation)
    private readonly participantIdentifiedSituationRepository: Repository<ParticipantIdentifiedSituation>,
    @InjectRepository(IdentifiedSituation)
    private readonly identifiedSituationRepository: Repository<IdentifiedSituation>,
    @InjectRepository(FollowUpPlanCatalog)
    private readonly followUpPlanCatalogRepository: Repository<FollowUpPlanCatalog>,
    private readonly dataSource: DataSource,
  ) {}

  async createCase(createCaseDto: CreateCaseDto): Promise<Case> {
    // Verificar que el participante existe
    const participant = await this.participantRepository.findOne({
      where: { id: createCaseDto.participantId },
    });

    if (!participant) {
      throw new NotFoundException(
        `Participante con ID ${createCaseDto.participantId} no encontrado`,
      );
    }

    // Usar transacción para crear el caso y todas las entidades médicas relacionadas
    return await this.dataSource.transaction(async (manager) => {
      // Generar número de caso único
      const caseNumber = await this.generateCaseNumber();

      // Crear el caso con los campos simples
      const newCase = manager.create(Case, {
        caseNumber,
        participantId: createCaseDto.participantId,
        status: CaseStatus.OPEN,
        consultationReason: createCaseDto.consultationReason,
        intervention: createCaseDto.intervention,
        referrals: createCaseDto.referrals,
      });

      const savedCase = await manager.save(newCase);

      // 5. Crear relaciones con FollowUpPlan si se proporcionan (ahora es array de IDs)
      if (createCaseDto.followUpPlan && createCaseDto.followUpPlan.length > 0) {
        for (const followUpPlanId of createCaseDto.followUpPlan) {
          // Verificar que el plan existe
          const followUpPlanExists = await manager.findOne(
            FollowUpPlanCatalog,
            {
              where: { id: followUpPlanId, isActive: true },
            },
          );

          if (followUpPlanExists) {
            const caseFollowUpPlan = manager.create(CaseFollowUpPlan, {
              caseId: savedCase.id,
              followUpPlanId: followUpPlanId,
            });
            await manager.save(caseFollowUpPlan);
          }
        }
      }

      // Crear PhysicalHealthHistory si se proporciona
      if (createCaseDto.physicalHealthHistory) {
        const physicalHealthHistory = manager.create(PhysicalHealthHistory, {
          ...createCaseDto.physicalHealthHistory,
          caseId: savedCase.id,
        });
        await manager.save(physicalHealthHistory);
      }

      // Crear MentalHealthHistory si se proporciona
      if (createCaseDto.mentalHealthHistory) {
        const mentalHealthHistory = manager.create(MentalHealthHistory, {
          ...createCaseDto.mentalHealthHistory,
          caseId: savedCase.id,
        });
        await manager.save(mentalHealthHistory);
      }

      // 8. Crear Weighing si se proporciona
      if (createCaseDto.weighing) {
        const weighing = manager.create(Weighing, {
          ...createCaseDto.weighing,
          caseId: savedCase.id,
        });
        await manager.save(weighing);
      }

      // 9. Crear InterventionPlans si se proporcionan
      if (
        createCaseDto.interventionPlans &&
        createCaseDto.interventionPlans.length > 0
      ) {
        for (const planData of createCaseDto.interventionPlans) {
          const interventionPlan = manager.create(InterventionPlan, {
            ...planData,
            caseId: savedCase.id,
          });
          await manager.save(interventionPlan);
        }
      }

      // 10. Crear ProgressNotes si se proporcionan
      if (
        createCaseDto.progressNotes &&
        createCaseDto.progressNotes.length > 0
      ) {
        for (const noteData of createCaseDto.progressNotes) {
          const progressNote = manager.create(ProgressNote, {
            sessionDate: new Date(noteData.sessionDate),
            sessionType: noteData.sessionType,
            summary: noteData.summary,
            observations: noteData.observations,
            agreements: noteData.agreements,
            caseId: savedCase.id,
          });
          await manager.save(progressNote);
        }
      }

      // 11. Referrals ya está incluido en el Case principal como campo simple

      // 3. Crear situaciones identificadas si se proporcionan
      if (
        createCaseDto.identifiedSituations &&
        createCaseDto.identifiedSituations.length > 0
      ) {
        // Buscar las situaciones identificadas por ID
        const situationPromises = createCaseDto.identifiedSituations.map(
          async (situationId) => {
            const identifiedSituation = await manager.findOne(
              IdentifiedSituation,
              {
                where: { id: situationId, isActive: true },
              },
            );

            if (identifiedSituation) {
              return manager.create(ParticipantIdentifiedSituation, {
                caseId: savedCase.id,
                identifiedSituationId: identifiedSituation.id,
              });
            }
            return null;
          },
        );

        const resolvedSituations = await Promise.all(situationPromises);
        const validSituations = resolvedSituations.filter(
          (situation): situation is ParticipantIdentifiedSituation =>
            situation !== null,
        );

        if (validSituations.length > 0) {
          await manager.save(validSituations);
        }
      }

      // 12. Crear nota de cierre si se proporciona
      if (createCaseDto.closingNote) {
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
      const completeCase = await manager.findOne(Case, {
        where: { id: savedCase.id },
        relations: [
          'participant',
          'caseFollowUpPlans',
          'caseFollowUpPlans.followUpPlan',
          'physicalHealthHistory',
          'mentalHealthHistory',
          'weighing',
          'interventionPlans',
          'progressNotes',
          'closingNote',
          'participantIdentifiedSituations',
          'participantIdentifiedSituations.identifiedSituation',
        ],
      });

      if (!completeCase) {
        throw new NotFoundException('Error al recuperar el caso creado');
      }

      return completeCase;
    });
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
      relations: ['participant'],
    });

    if (!caseEntity) {
      throw new NotFoundException(`Caso con ID ${caseId} no encontrado`);
    }

    return caseEntity;
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
}
