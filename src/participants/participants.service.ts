import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { SearchParticipantsDto } from './dto/search-participants.dto';
import { Participant } from './entities/participant.entity';
import { FamilyMember } from './entities/family-member.entity';
import { BioPsychosocialHistory } from './entities/bio-psychosocial-history.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { ParticipantEmergencyContact } from './entities/participant-emergency-contact.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(FamilyMember)
    private readonly familyMemberRepository: Repository<FamilyMember>,
    @InjectRepository(BioPsychosocialHistory)
    private readonly bioPsychosocialHistoryRepository: Repository<BioPsychosocialHistory>,
    @InjectRepository(EmergencyContact)
    private readonly emergencyContactRepository: Repository<EmergencyContact>,
    @InjectRepository(ParticipantEmergencyContact)
    private readonly participantEmergencyContactRepository: Repository<ParticipantEmergencyContact>,
  ) {}

  async create(
    createParticipantDto: CreateParticipantDto,
  ): Promise<Participant> {
    return await this.participantRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Extraer las relaciones anidadas del DTO principal
        const {
          familyMembers,
          bioPsychosocialHistory,
          emergencyContacts,
          ...participantData
        } = createParticipantDto;

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

        // 3. Crear contactos de emergencia (ManyToMany con pivot)
        if (emergencyContacts && emergencyContacts.length > 0) {
          for (const contactData of emergencyContacts) {
            const { relationshipId, ...emergencyContactInfo } = contactData;

            // Buscar si ya existe un contacto con el mismo email o teléfono (reutilización)
            let emergencyContact = await transactionalEntityManager.findOne(
              EmergencyContact,
              {
                where: [
                  { email: emergencyContactInfo.email },
                  { phone: emergencyContactInfo.phone },
                ],
              },
            );

            // Si no existe, crear nuevo contacto
            if (!emergencyContact) {
              emergencyContact = transactionalEntityManager.create(
                EmergencyContact,
                emergencyContactInfo,
              );
              emergencyContact =
                await transactionalEntityManager.save(emergencyContact);
            }

            // Crear la relación en la tabla pivot
            const participantEmergencyContact =
              transactionalEntityManager.create(ParticipantEmergencyContact, {
                participantId: savedParticipant.id,
                emergencyContactId: emergencyContact.id,
                relationshipId: relationshipId,
              });
            relationPromises.push(
              transactionalEntityManager.save(participantEmergencyContact),
            );
          }
        }

        // Ejecutar todas las creaciones de relaciones en paralelo (dentro de la transacción)
        if (relationPromises.length > 0) {
          await Promise.all(relationPromises);
        }

        // Retornar el participante con todas las relaciones cargadas
        const result = await transactionalEntityManager.findOne(Participant, {
          where: { id: savedParticipant.id },
          relations: [
            'familyMembers',
            'bioPsychosocialHistory',
            'cases',
            'emergencyContacts',
            'emergencyContacts.emergencyContact',
            'emergencyContacts.relationship',
          ],
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
        'familyMembers.familyRelationship',
        'bioPsychosocialHistory',
        'bioPsychosocialHistory.academicLevel',
        'bioPsychosocialHistory.incomeSource',
        'bioPsychosocialHistory.incomeLevel',
        'bioPsychosocialHistory.housingType',
        'emergencyContacts',
        'emergencyContacts.emergencyContact',
        'emergencyContacts.relationship',
        'cases',
        'documentType',
        'gender',
        'maritalStatus',
        'healthInsurance',
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
    return await this.participantRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const participant = await this.findOne(id);

        // Extraer emergency contacts si vienen en el DTO
        const { emergencyContacts, ...participantData } = updateParticipantDto;

        // Actualizar datos básicos del participante
        Object.assign(participant, participantData);
        await transactionalEntityManager.save(participant);

        // Si se enviaron emergency contacts, reemplazar los existentes
        if (emergencyContacts !== undefined) {
          // Eliminar relaciones existentes
          await transactionalEntityManager.delete(ParticipantEmergencyContact, {
            participantId: id,
          });

          // Crear nuevas relaciones
          if (emergencyContacts.length > 0) {
            for (const contactData of emergencyContacts) {
              const { relationshipId, ...emergencyContactInfo } = contactData;

              // Buscar o crear el contacto
              let emergencyContact = await transactionalEntityManager.findOne(
                EmergencyContact,
                {
                  where: [
                    { email: emergencyContactInfo.email },
                    { phone: emergencyContactInfo.phone },
                  ],
                },
              );

              if (!emergencyContact) {
                emergencyContact = transactionalEntityManager.create(
                  EmergencyContact,
                  emergencyContactInfo,
                );
                emergencyContact =
                  await transactionalEntityManager.save(emergencyContact);
              }

              // Crear la relación pivot
              const participantEmergencyContact =
                transactionalEntityManager.create(ParticipantEmergencyContact, {
                  participantId: id,
                  emergencyContactId: emergencyContact.id,
                  relationshipId: relationshipId,
                });
              await transactionalEntityManager.save(
                participantEmergencyContact,
              );
            }
          }
        }

        // Retornar participante actualizado con todas las relaciones
        return await this.findOne(id);
      },
    );
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
