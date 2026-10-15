import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { SearchParticipantsDto } from './dto/search-participants.dto';
import { Participant } from './entities/participant.entity';
import { FamilyMember } from './entities/family-member.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { ParticipantEmergencyContact } from './entities/participant-emergency-contact.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import {
  ParticipantAuditAction,
  ParticipantAuditLog,
} from '../audit/entities/participant-audit-log.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) {}

  async create(
    createParticipantDto: CreateParticipantDto,
    currentUser: User,
  ): Promise<Participant> {
    return await this.participantRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Extraer las relaciones anidadas del DTO principal
        const { familyMembers, emergencyContacts, ...participantData } =
          createParticipantDto;

        // Validar si el documentNumber ya existe (solo si se proporciona)
        if (participantData.documentNumber) {
          const existingByDocument = await transactionalEntityManager.findOne(
            Participant,
            {
              where: { documentNumber: participantData.documentNumber },
            },
          );

          if (existingByDocument) {
            throw new ConflictException(
              `El número de documento ${participantData.documentNumber} ya está registrado`,
            );
          }
        }

        // Validar si el email ya existe (solo si se proporciona)
        if (participantData.email) {
          const existingByEmail = await transactionalEntityManager.findOne(
            Participant,
            {
              where: { email: participantData.email },
            },
          );

          if (existingByEmail) {
            throw new ConflictException(
              `El email ${participantData.email} ya está registrado`,
            );
          }
        }

        // Crear el participante principal primero (dentro de la transacción)
        const participant = transactionalEntityManager.create(Participant, {
          ...participantData,
          registeredById: currentUser.id,
        });
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

        // Nota: bioPsychosocialHistory pertenece a Case (case_id es FK obligatoria
        // y única), no a Participant; se registra al crear el caso.

        // 2. Crear contactos de emergencia (ManyToMany con pivot)
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

        await this.recordAudit(
          transactionalEntityManager,
          savedParticipant.id,
          currentUser,
          ParticipantAuditAction.CREATE,
        );
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

  async findAllNoPagination(): Promise<{
    data: Participant[];
    total: number;
  }> {
    const participants = await this.participantRepository.find({
      order: { createdAt: 'DESC' },
    });

    return {
      data: participants,
      total: participants.length,
    };
  }

  async findOne(id: number): Promise<Participant> {
    const participant = await this.participantRepository.findOne({
      where: { id },
      relations: [
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
    currentUser: User,
  ): Promise<Participant> {
    return await this.participantRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const participant = await this.findOne(id);
        this.assertCanEditParticipant(participant, currentUser);

        // Extraer emergency contacts si vienen en el DTO
        const { emergencyContacts, ...participantData } = updateParticipantDto;

        // Validar si el email ya existe (solo si se proporciona y es diferente al actual)
        if (
          participantData.email &&
          participantData.email !== participant.email
        ) {
          const existingByEmail = await transactionalEntityManager.findOne(
            Participant,
            {
              where: { email: participantData.email },
            },
          );

          if (existingByEmail) {
            throw new ConflictException(
              `El email ${participantData.email} ya está registrado`,
            );
          }
        }

        // Actualizar datos básicos del participante
        Object.assign(participant, participantData);
        await transactionalEntityManager.save(participant);

        // Si se enviaron emergency contacts, reemplazar los existentes
        if (emergencyContacts !== undefined) {
          // Obtener contactos actuales del participante
          const currentContacts = await transactionalEntityManager.find(
            ParticipantEmergencyContact,
            {
              where: { participantId: id },
              relations: ['emergencyContact'],
            },
          );

          // Eliminar relaciones existentes
          await transactionalEntityManager.delete(ParticipantEmergencyContact, {
            participantId: id,
          });

          // Crear o actualizar contactos
          if (emergencyContacts.length > 0) {
            for (const contactData of emergencyContacts) {
              const { relationshipId, ...emergencyContactInfo } = contactData;

              // Buscar si este participante ya tenía este contacto (por email o phone)
              const existingContact = currentContacts.find(
                (pc) =>
                  pc.emergencyContact.email === emergencyContactInfo.email ||
                  pc.emergencyContact.phone === emergencyContactInfo.phone,
              );

              let emergencyContact: EmergencyContact;

              if (existingContact) {
                // Actualizar el contacto existente con los nuevos datos
                await transactionalEntityManager.update(
                  EmergencyContact,
                  { id: existingContact.emergencyContact.id },
                  emergencyContactInfo,
                );
                const updatedContact = await transactionalEntityManager.findOne(
                  EmergencyContact,
                  {
                    where: { id: existingContact.emergencyContact.id },
                  },
                );

                if (!updatedContact) {
                  throw new NotFoundException(
                    `Emergency contact with ID ${existingContact.emergencyContact.id} not found after update`,
                  );
                }

                emergencyContact = updatedContact;
              } else {
                // Buscar si existe un contacto con este email/phone en el sistema
                const foundContact = await transactionalEntityManager.findOne(
                  EmergencyContact,
                  {
                    where: [
                      { email: emergencyContactInfo.email },
                      { phone: emergencyContactInfo.phone },
                    ],
                  },
                );

                if (foundContact) {
                  emergencyContact = foundContact;
                } else {
                  // Crear nuevo contacto
                  emergencyContact = transactionalEntityManager.create(
                    EmergencyContact,
                    emergencyContactInfo,
                  );
                  emergencyContact =
                    await transactionalEntityManager.save(emergencyContact);
                }
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

        await this.recordAudit(
          transactionalEntityManager,
          id,
          currentUser,
          ParticipantAuditAction.UPDATE,
        );

        // Retornar participante actualizado con todas las relaciones
        return await this.findOne(id);
      },
    );
  }

  private assertCanEditParticipant(
    participant: Participant,
    currentUser: User,
  ): void {
    if (currentUser.role?.name === Role.ADMIN) {
      return;
    }

    if (
      currentUser.role?.name === Role.ADMIN_COUNTRY &&
      currentUser.countryId != null &&
      Number(participant.countryId) === Number(currentUser.countryId)
    ) {
      return;
    }

    if (
      currentUser.role?.name === Role.TRABAJO_SOCIAL &&
      Number(participant.registeredById) === Number(currentUser.id)
    ) {
      return;
    }

    if (currentUser.role?.name === Role.ADMIN_COUNTRY) {
      throw new ForbiddenException(
        'Solo puede editar participantes de su país asignado',
      );
    }

    if (currentUser.role?.name === Role.TRABAJO_SOCIAL) {
      throw new ForbiddenException(
        'Solo puede editar participantes que usted registró',
      );
    }

    throw new ForbiddenException(
      'No tiene permiso para editar este participante',
    );
  }

  async remove(id: number, currentUser: User): Promise<void> {
    await this.participantRepository.manager.transaction(async (manager) => {
      const participant = await manager.findOne(Participant, { where: { id } });
      if (!participant) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }
      await manager.softDelete(Participant, id);
      await this.recordAudit(
        manager,
        id,
        currentUser,
        ParticipantAuditAction.DELETE,
      );
    });
  }

  private async recordAudit(
    manager: EntityManager,
    participantId: number,
    currentUser: User,
    action: ParticipantAuditAction,
  ): Promise<void> {
    const entry = manager.create(ParticipantAuditLog, {
      participantId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: [
        currentUser.firstName,
        currentUser.secondName,
        currentUser.firstLastName,
        currentUser.secondLastName,
      ]
        .filter(Boolean)
        .join(' '),
      action,
      createdAt: new Date(),
    });
    await manager.save(entry);
  }

  async getDemographicStats() {
    const totalParticipants = await this.participantRepository.count({
      where: { deletedAt: undefined as any },
    });

    const base = () =>
      this.participantRepository
        .createQueryBuilder('p')
        .where('p.deletedAt IS NULL');

    // Por género — 1 query
    const genderRaw: { gender: string; count: string }[] = await base()
      .leftJoin('p.gender', 'g')
      .select("COALESCE(g.name, 'Sin especificar')", 'gender')
      .addSelect('COUNT(p.id)', 'count')
      .groupBy('g.name')
      .orderBy('count', 'DESC')
      .getRawMany();

    const byGender = genderRaw.map((row) => ({
      gender: row.gender,
      count: Number(row.count),
      percentage:
        totalParticipants > 0
          ? Math.round((Number(row.count) / totalParticipants) * 1000) / 10
          : 0,
    }));

    // Por ciudad (top 10) — 1 query
    const cityRaw: { city: string; count: string }[] = await base()
      .select("COALESCE(p.city, 'Sin especificar')", 'city')
      .addSelect('COUNT(p.id)', 'count')
      .groupBy('p.city')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const byCity = cityRaw.map((row) => ({
      city: row.city,
      count: Number(row.count),
      percentage:
        totalParticipants > 0
          ? Math.round((Number(row.count) / totalParticipants) * 1000) / 10
          : 0,
    }));

    // Por rango de edad — 1 sola query con CASE WHEN (antes eran 6 queries seriales)
    const ageRaw: { range_label: string; count: string }[] = await base()
      .select(
        `CASE
          WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) <= 17  THEN '0-17'
          WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) <= 25  THEN '18-25'
          WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) <= 35  THEN '26-35'
          WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) <= 45  THEN '36-45'
          WHEN TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) <= 60  THEN '46-60'
          ELSE '60+'
        END`,
        'range_label',
      )
      .addSelect('COUNT(p.id)', 'count')
      .groupBy('range_label')
      .getRawMany();

    const AGE_RANGE_ORDER = ['0-17', '18-25', '26-35', '36-45', '46-60', '60+'];
    const ageMap = new Map(ageRaw.map((r) => [r.range_label, Number(r.count)]));
    const byAgeRange = AGE_RANGE_ORDER.map((range) => {
      const count = ageMap.get(range) ?? 0;
      return {
        range,
        count,
        percentage:
          totalParticipants > 0
            ? Math.round((count / totalParticipants) * 1000) / 10
            : 0,
      };
    });

    // Por estado civil — 1 query
    const maritalRaw: { maritalStatus: string; count: string }[] = await base()
      .leftJoin('p.maritalStatus', 'ms')
      .select("COALESCE(ms.name, 'Sin especificar')", 'maritalStatus')
      .addSelect('COUNT(p.id)', 'count')
      .groupBy('ms.name')
      .orderBy('count', 'DESC')
      .getRawMany();

    const byMaritalStatus = maritalRaw.map((row) => ({
      maritalStatus: row.maritalStatus,
      count: Number(row.count),
      percentage:
        totalParticipants > 0
          ? Math.round((Number(row.count) / totalParticipants) * 1000) / 10
          : 0,
    }));

    return {
      totalParticipants,
      byGender,
      byCity,
      byAgeRange,
      byMaritalStatus,
    };
  }

  async checkDocumentExists(
    documentNumber: string,
  ): Promise<{ exists: boolean; participant?: any }> {
    const participant = await this.participantRepository.findOne({
      where: { documentNumber },
      select: [
        'id',
        'firstName',
        'secondName',
        'firstLastName',
        'secondLastName',
        'documentNumber',
        'email',
        'phoneNumber',
        'createdAt',
      ],
    });

    if (participant) {
      return {
        exists: true,
        participant: {
          id: participant.id,
          fullName:
            `${participant.firstName} ${participant.secondName || ''} ${participant.firstLastName} ${participant.secondLastName || ''}`.trim(),
          documentNumber: participant.documentNumber,
          email: participant.email,
          phoneNumber: participant.phoneNumber,
          createdAt: participant.createdAt,
        },
      };
    }

    return {
      exists: false,
    };
  }

  async findByUser(userId: number): Promise<{
    userId: number;
    total: number;
    participants: Array<{
      id: number;
      firstName: string;
      secondName?: string;
      firstLastName: string;
      secondLastName?: string;
      fullName: string;
      documentNumber?: string;
      phoneNumber?: string;
      email?: string;
      city?: string;
      createdAt: Date;
    }>;
  }> {
    const participants = await this.participantRepository.find({
      where: { registeredById: userId },
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'firstName',
        'secondName',
        'firstLastName',
        'secondLastName',
        'documentNumber',
        'phoneNumber',
        'email',
        'city',
        'createdAt',
      ],
    });

    return {
      userId,
      total: participants.length,
      participants: participants.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        secondName: p.secondName,
        firstLastName: p.firstLastName,
        secondLastName: p.secondLastName,
        fullName:
          `${p.firstName} ${p.secondName || ''} ${p.firstLastName} ${p.secondLastName || ''}`.trim(),
        documentNumber: p.documentNumber,
        phoneNumber: p.phoneNumber,
        email: p.email,
        city: p.city,
        createdAt: p.createdAt,
      })),
    };
  }

  async findByCountry(countryId: number): Promise<{
    countryId: number;
    total: number;
    participants: Array<{
      id: number;
      firstName: string;
      secondName?: string;
      firstLastName: string;
      secondLastName?: string;
      fullName: string;
      documentNumber?: string;
      phoneNumber?: string;
      email?: string;
      city?: string;
      createdAt: Date;
    }>;
  }> {
    const participants = await this.participantRepository.find({
      where: { countryId },
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'firstName',
        'secondName',
        'firstLastName',
        'secondLastName',
        'documentNumber',
        'phoneNumber',
        'email',
        'city',
        'createdAt',
      ],
    });

    return {
      countryId,
      total: participants.length,
      participants: participants.map((participant) => ({
        id: participant.id,
        firstName: participant.firstName,
        secondName: participant.secondName,
        firstLastName: participant.firstLastName,
        secondLastName: participant.secondLastName,
        fullName:
          `${participant.firstName} ${participant.secondName || ''} ${participant.firstLastName} ${participant.secondLastName || ''}`.trim(),
        documentNumber: participant.documentNumber,
        phoneNumber: participant.phoneNumber,
        email: participant.email,
        city: participant.city,
        createdAt: participant.createdAt,
      })),
    };
  }

  async checkEmailExists(
    email: string,
  ): Promise<{ exists: boolean; participantId?: number }> {
    const participant = await this.participantRepository.findOne({
      where: { email },
      select: ['id', 'email'],
    });

    if (participant) {
      return {
        exists: true,
        participantId: participant.id,
      };
    }

    return {
      exists: false,
    };
  }
}
