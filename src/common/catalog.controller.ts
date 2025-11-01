import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DocumentType,
  Gender,
  MaritalStatus,
  HealthInsurance,
  FamilyRelationship,
  AcademicLevel,
  IncomeSource,
  IncomeLevel,
  HousingType,
  FollowUpPlanType,
  TreatmentStatus,
  ApproachType,
  ProcessType,
} from './entities';

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
    private readonly familyRelationshipRepository: Repository<FamilyRelationship>,
    @InjectRepository(AcademicLevel)
    private readonly academicLevelRepository: Repository<AcademicLevel>,
    @InjectRepository(IncomeSource)
    private readonly incomeSourceRepository: Repository<IncomeSource>,
    @InjectRepository(IncomeLevel)
    private readonly incomeLevelRepository: Repository<IncomeLevel>,
    @InjectRepository(HousingType)
    private readonly housingTypeRepository: Repository<HousingType>,
    @InjectRepository(FollowUpPlanType)
    private readonly followUpPlanTypeRepository: Repository<FollowUpPlanType>,
    @InjectRepository(TreatmentStatus)
    private readonly treatmentStatusRepository: Repository<TreatmentStatus>,
    @InjectRepository(ApproachType)
    private readonly approachTypeRepository: Repository<ApproachType>,
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

  @Get('family-relationships')
  async getFamilyRelationships() {
    return this.familyRelationshipRepository.find({ order: { name: 'ASC' } });
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

  @Get('follow-up-plan-types')
  async getFollowUpPlanTypes() {
    return this.followUpPlanTypeRepository.find({ order: { name: 'ASC' } });
  }

  @Get('treatment-statuses')
  async getTreatmentStatuses() {
    return this.treatmentStatusRepository.find({ order: { name: 'ASC' } });
  }

  @Get('approach-types')
  async getApproachTypes() {
    return this.approachTypeRepository.find({ order: { name: 'ASC' } });
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
      familyRelationships,
      academicLevels,
      incomeSources,
      incomeLevels,
      housingTypes,
      followUpPlanTypes,
      treatmentStatuses,
      approachTypes,
      processTypes,
    ] = await Promise.all([
      this.documentTypeRepository.find({ order: { name: 'ASC' } }),
      this.genderRepository.find({ order: { name: 'ASC' } }),
      this.maritalStatusRepository.find({ order: { name: 'ASC' } }),
      this.healthInsuranceRepository.find({ order: { name: 'ASC' } }),
      this.familyRelationshipRepository.find({ order: { name: 'ASC' } }),
      this.academicLevelRepository.find({ order: { name: 'ASC' } }),
      this.incomeSourceRepository.find({ order: { name: 'ASC' } }),
      this.incomeLevelRepository.find({ order: { name: 'ASC' } }),
      this.housingTypeRepository.find({ order: { name: 'ASC' } }),
      this.followUpPlanTypeRepository.find({ order: { name: 'ASC' } }),
      this.treatmentStatusRepository.find({ order: { name: 'ASC' } }),
      this.approachTypeRepository.find({ order: { name: 'ASC' } }),
      this.processTypeRepository.find({ order: { name: 'ASC' } }),
    ]);

    return {
      documentTypes,
      genders,
      maritalStatuses,
      healthInsurances,
      familyRelationships,
      academicLevels,
      incomeSources,
      incomeLevels,
      housingTypes,
      followUpPlanTypes,
      treatmentStatuses,
      approachTypes,
      processTypes,
    };
  }
}
