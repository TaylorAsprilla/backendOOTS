import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Case } from '../participants/entities/case.entity';
import { Participant } from '../participants/entities/participant.entity';
import { BioPsychosocialHistory } from '../participants/entities/bio-psychosocial-history.entity';
import { ConsultationReason } from '../participants/entities/consultation-reason.entity';
import { Intervention } from '../participants/entities/intervention.entity';
import { FollowUpPlan } from '../participants/entities/follow-up-plan.entity';
import { PhysicalHealthHistory } from '../participants/entities/physical-health-history.entity';
import { MentalHealthHistory } from '../participants/entities/mental-health-history.entity';
import { Assessment } from '../participants/entities/assessment.entity';
import { InterventionPlan } from '../participants/entities/intervention-plan.entity';
import { ProgressNote } from '../participants/entities/progress-note.entity';
import { Referrals } from '../participants/entities/referrals.entity';
import { CreateCaseDto, UpdateCaseStatusDto } from './dto/case.dto';
import { CaseStatus } from '../common/enums';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(BioPsychosocialHistory)
    private readonly bioPsychosocialHistoryRepository: Repository<BioPsychosocialHistory>,
    @InjectRepository(ConsultationReason)
    private readonly consultationReasonRepository: Repository<ConsultationReason>,
    @InjectRepository(Intervention)
    private readonly interventionRepository: Repository<Intervention>,
    @InjectRepository(FollowUpPlan)
    private readonly followUpPlanRepository: Repository<FollowUpPlan>,
    @InjectRepository(PhysicalHealthHistory)
    private readonly physicalHealthHistoryRepository: Repository<PhysicalHealthHistory>,
    @InjectRepository(MentalHealthHistory)
    private readonly mentalHealthHistoryRepository: Repository<MentalHealthHistory>,
    @InjectRepository(Assessment)
    private readonly assessmentRepository: Repository<Assessment>,
    @InjectRepository(InterventionPlan)
    private readonly interventionPlanRepository: Repository<InterventionPlan>,
    @InjectRepository(ProgressNote)
    private readonly progressNoteRepository: Repository<ProgressNote>,
    @InjectRepository(Referrals)
    private readonly referralsRepository: Repository<Referrals>,
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

      // Crear el caso
      const newCase = manager.create(Case, {
        title: createCaseDto.title,
        description: createCaseDto.description,
        caseNumber,
        participantId: createCaseDto.participantId,
        status: CaseStatus.OPEN,
      });

      const savedCase = await manager.save(newCase);

      // Crear BioPsychosocialHistory si se proporciona
      if (createCaseDto.bioPsychosocialHistory) {
        const bioPsychosocialHistory = manager.create(BioPsychosocialHistory, {
          ...createCaseDto.bioPsychosocialHistory,
          caseId: savedCase.id,
        });
        await manager.save(bioPsychosocialHistory);
      }

      // Crear ConsultationReason si se proporciona
      if (createCaseDto.consultationReason) {
        const consultationReason = manager.create(ConsultationReason, {
          ...createCaseDto.consultationReason,
          caseId: savedCase.id,
        });
        await manager.save(consultationReason);
      }

      // Crear Intervention si se proporciona
      if (createCaseDto.intervention) {
        const intervention = manager.create(Intervention, {
          ...createCaseDto.intervention,
          caseId: savedCase.id,
        });
        await manager.save(intervention);
      }

      // Crear FollowUpPlan si se proporciona
      if (createCaseDto.followUpPlan) {
        const followUpPlan = manager.create(FollowUpPlan, {
          ...createCaseDto.followUpPlan,
          caseId: savedCase.id,
        });
        await manager.save(followUpPlan);
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

      // Crear Assessment si se proporciona
      if (createCaseDto.assessment) {
        const assessment = manager.create(Assessment, {
          ...createCaseDto.assessment,
          caseId: savedCase.id,
        });
        await manager.save(assessment);
      }

      // Crear InterventionPlans si se proporcionan
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

      // Crear ProgressNotes si se proporcionan
      if (
        createCaseDto.progressNotes &&
        createCaseDto.progressNotes.length > 0
      ) {
        for (const noteData of createCaseDto.progressNotes) {
          const progressNote = manager.create(ProgressNote, {
            ...noteData,
            caseId: savedCase.id,
          });
          await manager.save(progressNote);
        }
      }

      // Crear Referrals si se proporciona
      if (createCaseDto.referrals) {
        const referrals = manager.create(Referrals, {
          ...createCaseDto.referrals,
          caseId: savedCase.id,
        });
        await manager.save(referrals);
      }

      return savedCase;
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
