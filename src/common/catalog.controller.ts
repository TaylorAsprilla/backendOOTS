import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from '../document-types/entities';
import { Gender } from '../genders/entities';
import { MaritalStatus } from '../marital-status/entities';
import { HealthInsurance } from '../health-insurance/entities';
import { FamilyRelationship } from '../family-relationship/entities';
import { IncomeSource } from '../income-source/entities';
import { IncomeLevel } from '../income-level/entities';
import { HousingType } from '../housing-type/entities';
import { AcademicLevel } from 'src/academic-levels/entities/academic-level.entity';
import { TreatmentStatus } from 'src/treatment-statuses/entities/treatment-status.entity';
import { ProcessType } from 'src/process-types/entities/process-type.entity';

@Controller('api/v1/catalogs')
export class CatalogController {
  constructor(
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,
    @InjectRepository(MaritalStatus)
    private readonly maritalStatusRepository: Repository<MaritalStatus>,
    @InjectRepository(HealthInsurance)
    private readonly healthInsuranceRepository: Repository<HealthInsurance>,
    @InjectRepository(FamilyRelationship)
    private readonly relationshipRepository: Repository<FamilyRelationship>,
    @InjectRepository(AcademicLevel)
    private readonly academicLevelRepository: Repository<AcademicLevel>,
    @InjectRepository(IncomeSource)
    private readonly incomeSourceRepository: Repository<IncomeSource>,
    @InjectRepository(IncomeLevel)
    private readonly incomeLevelRepository: Repository<IncomeLevel>,
    @InjectRepository(HousingType)
    private readonly housingTypeRepository: Repository<HousingType>,
    @InjectRepository(TreatmentStatus)
    private readonly treatmentStatusRepository: Repository<TreatmentStatus>,
    @InjectRepository(ProcessType)
    private readonly processTypeRepository: Repository<ProcessType>,
  ) {}

  @Get('document-types')
  async getDocumentTypes() {
    return this.documentTypeRepository.find({ order: { name: 'ASC' } });
  }

  @Get('genders')
  async getGenders() {
    return this.genderRepository.find({ order: { name: 'ASC' } });
  }

  @Get('marital-statuses')
  async getMaritalStatuses() {
    return this.maritalStatusRepository.find({ order: { name: 'ASC' } });
  }

  @Get('health-insurances')
  async getHealthInsurances() {
    return this.healthInsuranceRepository.find({ order: { name: 'ASC' } });
  }

  @Get('relationships')
  async getRelationships() {
    return this.relationshipRepository.find({ order: { name: 'ASC' } });
  }

  @Get('academic-levels')
  async getAcademicLevels() {
    return this.academicLevelRepository.find({ order: { name: 'ASC' } });
  }

  @Get('income-sources')
  async getIncomeSources() {
    return this.incomeSourceRepository.find({ order: { name: 'ASC' } });
  }

  @Get('income-levels')
  async getIncomeLevels() {
    return this.incomeLevelRepository.find({ order: { name: 'ASC' } });
  }

  @Get('housing-types')
  async getHousingTypes() {
    return this.housingTypeRepository.find({ order: { name: 'ASC' } });
  }

  @Get('treatment-statuses')
  async getTreatmentStatuses() {
    return this.treatmentStatusRepository.find({ order: { name: 'ASC' } });
  }

  @Get('process-types')
  async getProcessTypes() {
    return this.processTypeRepository.find({ order: { name: 'ASC' } });
  }

  @Get('all')
  async getAllCatalogs() {
    const [
      documentTypes,
      genders,
      maritalStatuses,
      healthInsurances,
      relationships,
      academicLevels,
      incomeSources,
      incomeLevels,
      housingTypes,
      treatmentStatuses,
      processTypes,
    ] = await Promise.all([
      this.documentTypeRepository.find({ order: { name: 'ASC' } }),
      this.genderRepository.find({ order: { name: 'ASC' } }),
      this.maritalStatusRepository.find({ order: { name: 'ASC' } }),
      this.healthInsuranceRepository.find({ order: { name: 'ASC' } }),
      this.relationshipRepository.find({ order: { name: 'ASC' } }),
      this.academicLevelRepository.find({ order: { name: 'ASC' } }),
      this.incomeSourceRepository.find({ order: { name: 'ASC' } }),
      this.incomeLevelRepository.find({ order: { name: 'ASC' } }),
      this.housingTypeRepository.find({ order: { name: 'ASC' } }),
      this.treatmentStatusRepository.find({ order: { name: 'ASC' } }),
      this.processTypeRepository.find({ order: { name: 'ASC' } }),
    ]);

    return {
      documentTypes,
      genders,
      maritalStatuses,
      healthInsurances,
      relationships,
      academicLevels,
      incomeSources,
      incomeLevels,
      housingTypes,
      treatmentStatuses,
      processTypes,
    };
  }
}
