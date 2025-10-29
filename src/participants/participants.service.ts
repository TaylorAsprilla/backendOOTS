import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { SearchParticipantsDto } from './dto/search-participants.dto';
import { Participant } from './entities/participant.entity';
import { FamilyMember } from './entities/family-member.entity';
import { BioPsychosocialHistory } from './entities/bio-psychosocial-history.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(FamilyMember)
    private readonly familyMemberRepository: Repository<FamilyMember>,
    @InjectRepository(BioPsychosocialHistory)
    private readonly bioPsychosocialHistoryRepository: Repository<BioPsychosocialHistory>,
  ) {}

  async create(
    createParticipantDto: CreateParticipantDto,
  ): Promise<Participant> {
    return await this.participantRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Extraer las relaciones anidadas del DTO principal
        const { familyMembers, bioPsychosocialHistory, ...participantData } =
          createParticipantDto;

        // Crear el participante principal primero (dentro de la transacción)
        const participant = transactionalEntityManager.create(
          Participant,
          participantData,
        );
        const savedParticipant =
          await transactionalEntityManager.save(participant);

        // Crear relaciones OneToMany y OneToOne
        const relationPromises: Promise<any>[] = [];

        // 1. Crear miembros de familia (OneToMany)
        if (familyMembers && familyMembers.length > 0) {
          const familyMemberEntities = familyMembers.map((memberData) =>
            transactionalEntityManager.create(FamilyMember, {
              ...memberData,
              participant: savedParticipant,
            }),
          );
          relationPromises.push(
            transactionalEntityManager.save(familyMemberEntities),
          );
        }

        // 2. Crear historial biopsicosocial (OneToOne)
        if (bioPsychosocialHistory) {
          const bioPsychosocialEntity = transactionalEntityManager.create(
            BioPsychosocialHistory,
            {
              ...bioPsychosocialHistory,
              participantId: savedParticipant.id,
            },
          );
          relationPromises.push(
            transactionalEntityManager.save(bioPsychosocialEntity),
          );
        }

        // Ejecutar todas las creaciones de relaciones en paralelo (dentro de la transacción)
        if (relationPromises.length > 0) {
          await Promise.all(relationPromises);
        }

        // Retornar el participante con todas las relaciones cargadas
        const result = await transactionalEntityManager.findOne(Participant, {
          where: { id: savedParticipant.id },
          relations: ['familyMembers', 'bioPsychosocialHistory', 'cases'],
        });

        if (!result) {
          throw new NotFoundException(
            `Participant with ID ${savedParticipant.id} not found after creation`,
          );
        }

        return result;
      },
    );
  }

  async findAll(searchDto?: SearchParticipantsDto) {
    const query = this.participantRepository.createQueryBuilder('participant');

    // Aplicar filtros básicos
    if (searchDto?.search) {
      query.andWhere(
        '(participant.firstName LIKE :search OR participant.firstLastName LIKE :search)',
        { search: `%${searchDto.search}%` },
      );
    }

    // Paginación básica
    const page = Number(searchDto?.page) || 1;
    const limit = Number(searchDto?.limit) || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);
    query.orderBy('participant.createdAt', 'DESC');

    const [participants, total] = await query.getManyAndCount();

    return {
      data: participants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Participant> {
    const participant = await this.participantRepository.findOne({
      where: { id },
      relations: [
        'familyMembers',
        'bioPsychosocialHistory',
        'bioPsychosocialHistory.educationLevel',
        'bioPsychosocialHistory.incomeSource',
        'bioPsychosocialHistory.incomeLevel',
        'bioPsychosocialHistory.housingType',
        'cases',
        'documentType',
        'gender',
        'maritalStatus',
        'healthInsurance',
        'emergencyContactRelationship',
        'registeredBy',
      ],
    });

    if (!participant) {
      throw new NotFoundException(`Participant with ID ${id} not found`);
    }

    return participant;
  }

  async update(
    id: number,
    updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    const participant = await this.findOne(id);
    Object.assign(participant, updateParticipantDto);
    return await this.participantRepository.save(participant);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verificar que existe
    await this.participantRepository.softDelete(id);
  }

  async getDemographicStats() {
    const totalParticipants = await this.participantRepository.count();

    return {
      totalParticipants,
      byGender: [],
      byCity: [],
      byAgeRange: [],
    };
  }
}
