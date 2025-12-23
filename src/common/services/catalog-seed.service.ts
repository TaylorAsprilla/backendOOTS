import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from '../../document-types/entities';
import { Gender } from '../../genders/entities';
import { MaritalStatus } from '../../marital-status/entities';
import { HealthInsurance } from '../../health-insurance/entities';
import { HousingType } from '../../housing-type/entities';
import { FamilyRelationship } from '../../family-relationship/entities';
import { IncomeSource } from '../../income-source/entities';
import { IncomeLevel } from '../../income-level/entities';
import { AcademicLevel } from 'src/academic-levels/entities/academic-level.entity';
import { IdentifiedSituation } from 'src/identified-situations/entities';
import { TreatmentStatus } from 'src/treatment-statuses/entities/treatment-status.entity';
import { ApproachType } from 'src/catalogs/entities/approach-type.entity';
import { ProcessType } from 'src/catalogs/entities/process-type.entity';

@Injectable()
export class CatalogSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,

    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,

    @InjectRepository(MaritalStatus)
    private readonly maritalStatusRepository: Repository<MaritalStatus>,

    @InjectRepository(HealthInsurance)
    private readonly healthInsuranceRepository: Repository<HealthInsurance>,

    @InjectRepository(HousingType)
    private readonly housingTypeRepository: Repository<HousingType>,

    @InjectRepository(FamilyRelationship)
    private readonly relationshipRepository: Repository<FamilyRelationship>,

    @InjectRepository(AcademicLevel)
    private readonly academicLevelRepository: Repository<AcademicLevel>,

    @InjectRepository(IncomeSource)
    private readonly incomeSourceRepository: Repository<IncomeSource>,

    @InjectRepository(IncomeLevel)
    private readonly incomeLevelRepository: Repository<IncomeLevel>,

    @InjectRepository(IdentifiedSituation)
    private readonly identifiedSituationRepository: Repository<IdentifiedSituation>,

    @InjectRepository(TreatmentStatus)
    private readonly treatmentStatusRepository: Repository<TreatmentStatus>,

    @InjectRepository(ApproachType)
    private readonly approachTypeRepository: Repository<ApproachType>,

    @InjectRepository(ProcessType)
    private readonly processTypeRepository: Repository<ProcessType>,
  ) {}

  async onModuleInit() {
    await this.seedAllCatalogs();
  }

  private async seedAllCatalogs() {
    console.log('🌱 Starting catalog seeding...');

    await this.seedDocumentTypes();
    await this.seedGenders();
    await this.seedMaritalStatuses();
    await this.seedHealthInsurances();
    await this.seedHousingTypes();
    await this.seedRelationships();
    await this.seedAcademicLevels();
    await this.seedIncomeSources();
    await this.seedIncomeLevels();
    await this.seedIdentifiedSituations();
    await this.seedTreatmentStatuses();
    await this.seedApproachTypes();
    await this.seedProcessTypes();

    console.log('✅ Catalog seeding completed!');
  }

  private async seedDocumentTypes() {
    const count = await this.documentTypeRepository.count();
    if (count > 0) return;

    const documentTypes = [
      {
        name: 'Cédula de Ciudadanía',
        code: 'CC',
        description: 'Documento de identificación para ciudadanos colombianos',
      },
      {
        name: 'Tarjeta de Identidad',
        code: 'TI',
        description: 'Documento de identificación para menores de edad',
      },
      {
        name: 'Cédula de Extranjería',
        code: 'CE',
        description: 'Documento de identificación para extranjeros residentes',
      },
      {
        name: 'Pasaporte',
        code: 'PA',
        description: 'Documento de identificación internacional',
      },
    ];

    await this.documentTypeRepository.save(documentTypes);
    console.log('📄 Document types seeded');
  }

  private async seedGenders() {
    const count = await this.genderRepository.count();
    if (count > 0) return;

    const genders = [
      { name: 'Femenino', code: 'F' },
      { name: 'Masculino', code: 'M' },
      { name: 'Prefiero No Decirlo', code: 'PND' },
    ];

    await this.genderRepository.save(genders);
    console.log('👥 Genders seeded');
  }

  private async seedMaritalStatuses() {
    const count = await this.maritalStatusRepository.count();
    if (count > 0) return;

    const maritalStatuses = [
      { name: 'Soltero', code: 'S' },
      { name: 'Casado', code: 'C' },
      { name: 'Unión Libre', code: 'UL' },
      { name: 'Divorciado', code: 'D' },
      { name: 'Separado', code: 'SEP' },
      { name: 'Viudo', code: 'V' },
    ];

    await this.maritalStatusRepository.save(maritalStatuses);
    console.log('💑 Marital statuses seeded');
  }

  private async seedHealthInsurances() {
    const count = await this.healthInsuranceRepository.count();
    if (count > 0) return;

    const healthInsurances = [
      { name: 'SURA', code: 'SURA', allowsCustom: false },
      { name: 'Nueva EPS', code: 'NEPS', allowsCustom: false },
      { name: 'Compensar', code: 'COMP', allowsCustom: false },
      { name: 'Famisanar', code: 'FAMI', allowsCustom: false },
      { name: 'Sanitas', code: 'SANI', allowsCustom: false },
      { name: 'Salud Total', code: 'STOT', allowsCustom: false },
      { name: 'Medimás', code: 'MEDI', allowsCustom: false },
      { name: 'Cajacopi', code: 'CAJA', allowsCustom: false },
      { name: 'Comfenalco', code: 'COMF', allowsCustom: false },
      { name: 'Otro', code: 'OTHER', allowsCustom: true },
    ];

    await this.healthInsuranceRepository.save(healthInsurances);
    console.log('🏥 Health insurances seeded');
  }

  private async seedHousingTypes() {
    const count = await this.housingTypeRepository.count();
    if (count > 0) return;

    const housingTypes = [
      {
        name: 'Propia',
        code: 'PROP',
        description: 'Vivienda de propiedad del participante',
      },
      {
        name: 'Arriendo',
        code: 'ARR',
        description: 'Vivienda en arriendo',
      },
      {
        name: 'Familiar',
        code: 'FAM',
        description: 'Vivienda de familiares',
      },
    ];

    await this.housingTypeRepository.save(housingTypes);
    console.log('🏠 Housing types seeded');
  }

  private async seedRelationships() {
    const count = await this.relationshipRepository.count();
    if (count > 0) return;

    const relationships = [
      { name: 'Padre', code: 'PAD', genderSpecific: true },
      { name: 'Madre', code: 'MAD', genderSpecific: true },
      { name: 'Hermano', code: 'HERM', genderSpecific: true },
      { name: 'Hermana', code: 'HERA', genderSpecific: true },
      { name: 'Hijo', code: 'HIJO', genderSpecific: true },
      { name: 'Hija', code: 'HIJA', genderSpecific: true },
      { name: 'Esposo', code: 'ESPO', genderSpecific: true },
      { name: 'Esposa', code: 'ESPA', genderSpecific: true },
      { name: 'Tio', code: 'TIO', genderSpecific: true },
      { name: 'Tia', code: 'TIA', genderSpecific: true },
      { name: 'Abuelo', code: 'ABUE', genderSpecific: true },
      { name: 'Abuela', code: 'ABUA', genderSpecific: true },
      { name: 'Primo', code: 'PRIM', genderSpecific: true },
      { name: 'Prima', code: 'PRIA', genderSpecific: true },
      { name: 'Sobrino', code: 'SOBR', genderSpecific: true },
      { name: 'Sobrina', code: 'SOBA', genderSpecific: true },
      { name: 'Nieto', code: 'NIET', genderSpecific: true },
      { name: 'Nieta', code: 'NIEA', genderSpecific: true },
      { name: 'Cuñado', code: 'CUÑ', genderSpecific: true },
      { name: 'Cuñada', code: 'CUÑA', genderSpecific: true },
      { name: 'Yerno', code: 'YERN', genderSpecific: true },
      { name: 'Nuera', code: 'NUER', genderSpecific: true },
      { name: 'Suegro', code: 'SUEG', genderSpecific: true },
      { name: 'Suegra', code: 'SUEA', genderSpecific: true },
      { name: 'Otro', code: 'OTR', genderSpecific: false },
      { name: 'Amigo', code: 'AMIG', genderSpecific: false },
      { name: 'Conocido', code: 'CONO', genderSpecific: false },
      { name: 'Vecino', code: 'VEC', genderSpecific: false },
    ];

    await this.relationshipRepository.save(relationships);
    console.log('👨‍👩‍👧‍👦 Relationships seeded');
  }

  private async seedAcademicLevels() {
    const count = await this.academicLevelRepository.count();
    if (count > 0) return;

    const academicLevels = [
      { name: 'Sin Grado Académico' },
      { name: 'Preescolar' },
      { name: 'Primaria' },
      { name: 'Secundaria' },
      { name: 'Técnico' },
      { name: 'Tecnólogo' },
      { name: 'Pregrado' },
      { name: 'Especialización' },
      { name: 'Maestria' },
      { name: 'Doctorado' },
      { name: 'Postdoctorado' },
    ];

    await this.academicLevelRepository.save(academicLevels);
    console.log('🎓 Academic levels seeded');
  }

  private async seedIncomeSources() {
    const count = await this.incomeSourceRepository.count();
    if (count > 0) return;

    const incomeSources = [
      {
        name: 'Sueldo',
        code: 'SUE',
        description: 'Ingresos por trabajo dependiente',
      },
      {
        name: 'Rentas',
        code: 'REN',
        description: 'Ingresos por propiedades en arriendo',
      },
      {
        name: 'Seguro',
        code: 'SEG',
        description: 'Ingresos por seguros',
      },
      {
        name: 'Pensiones',
        code: 'PEN',
        description: 'Ingresos por pensión',
      },
      {
        name: 'Giros',
        code: 'GIR',
        description: 'Ingresos por remesas',
      },
      {
        name: 'Negocio propio',
        code: 'NEG',
        description: 'Ingresos por negocio independiente',
      },
      {
        name: 'Otro',
        code: 'OTR',
        description: 'Otros tipos de ingresos',
      },
    ];

    await this.incomeSourceRepository.save(incomeSources);
    console.log('💰 Income sources seeded');
  }

  private async seedIncomeLevels() {
    const count = await this.incomeLevelRepository.count();
    if (count > 0) return;

    const incomeLevels = [
      {
        name: 'Menos de 1 SMLV',
        code: 'M1S',
        orderIndex: 1,
        minAmount: 0,
        maxAmount: 1160000,
      },
      {
        name: '1 SMLV',
        code: '1SM',
        orderIndex: 2,
        minAmount: 1160000,
        maxAmount: 1160000,
      },
      {
        name: 'Más de 1 SMLV',
        code: 'MA1',
        orderIndex: 3,
        minAmount: 1160000,
        maxAmount: undefined,
      },
    ];

    await this.incomeLevelRepository.save(incomeLevels);
    console.log('💵 Income levels seeded');
  }

  private async seedIdentifiedSituations() {
    const count = await this.identifiedSituationRepository.count();
    if (count > 0) return;

    const situations = [
      {
        name: 'Orientación general',
        code: 'ORI_GEN',
        category: 'General',
        severityLevel: 'Baja',
      },
      {
        name: 'Vivienda',
        code: 'VIV',
        category: 'Social',
        severityLevel: 'Media',
      },
      {
        name: 'Falta de empleo',
        code: 'EMP',
        category: 'Económica',
        severityLevel: 'Alta',
      },
      {
        name: 'Baja autoestima',
        code: 'AUT',
        category: 'Psicológica',
        severityLevel: 'Media',
      },
      {
        name: 'Estrés',
        code: 'EST',
        category: 'Psicológica',
        severityLevel: 'Media',
      },
      {
        name: 'Conducta agresiva',
        code: 'AGR',
        category: 'Comportamental',
        severityLevel: 'Alta',
      },
      {
        name: 'Violencia en el hogar',
        code: 'VIH',
        category: 'Familiar',
        severityLevel: 'Crítica',
      },
      {
        name: 'Embarazo adolescente',
        code: 'EMB_ADO',
        category: 'Salud',
        severityLevel: 'Alta',
      },
      {
        name: 'Depresión',
        code: 'DEP',
        category: 'Psicológica',
        severityLevel: 'Alta',
      },
      {
        name: 'Problemas psiquiátricos',
        code: 'PSI',
        category: 'Salud Mental',
        severityLevel: 'Crítica',
      },
      {
        name: 'Problemas familiares',
        code: 'FAM',
        category: 'Familiar',
        severityLevel: 'Media',
      },
      {
        name: 'Conflictos maritales',
        code: 'MAR',
        category: 'Familiar',
        severityLevel: 'Media',
      },
      {
        name: 'Crisis de divorcio',
        code: 'DIV',
        category: 'Familiar',
        severityLevel: 'Alta',
      },
      {
        name: 'Abuso de alcohol',
        code: 'ALC',
        category: 'Adicciones',
        severityLevel: 'Alta',
      },
      {
        name: 'Problemas financieros',
        code: 'FIN',
        category: 'Económica',
        severityLevel: 'Media',
      },
      {
        name: 'Desórdenes alimenticios',
        code: 'ALI',
        category: 'Salud',
        severityLevel: 'Alta',
      },
      {
        name: 'Problemas espirituales',
        code: 'ESP',
        category: 'Espiritual',
        severityLevel: 'Media',
      },
      {
        name: 'Seguro social',
        code: 'SEG_SOC',
        category: 'Social',
        severityLevel: 'Media',
      },
      {
        name: 'Problemas con alguna agencia gubernamental',
        code: 'GOB',
        category: 'Legal',
        severityLevel: 'Media',
      },
      {
        name: 'Uso de drogas ilícitas',
        code: 'DRO',
        category: 'Adicciones',
        severityLevel: 'Crítica',
      },
      {
        name: 'Otros',
        code: 'OTR',
        category: 'General',
        severityLevel: 'Variable',
      },
    ];

    await this.identifiedSituationRepository.save(situations);
    console.log('🎯 Identified situations seeded');
  }

  private async seedApproachTypes() {
    const count = await this.approachTypeRepository.count();
    if (count > 0) return;

    const approachTypes = [
      {
        name: 'Terapia Cognitivo-Conductual',
        description:
          'Enfoque terapéutico que trabaja en la modificación de pensamientos y conductas disfuncionales',
      },
      {
        name: 'Terapia Psicodinámica',
        description:
          'Enfoque basado en la exploración del inconsciente y experiencias tempranas',
      },
      {
        name: 'Terapia Humanista',
        description:
          'Enfoque centrado en la persona y su potencial de crecimiento',
      },
      {
        name: 'Terapia Sistémica',
        description:
          'Enfoque que considera al individuo dentro de su sistema familiar y social',
      },
      {
        name: 'Terapia Gestalt',
        description: 'Enfoque experiencial centrado en el aquí y ahora',
      },
      {
        name: 'Terapia de Aceptación y Compromiso (ACT)',
        description: 'Enfoque basado en mindfulness y valores personales',
      },
      {
        name: 'Terapia Narrativa',
        description:
          'Enfoque que explora las historias personales y su reescritura',
      },
      {
        name: 'Intervención en Crisis',
        description:
          'Abordaje inmediato para situaciones de emergencia psicológica',
      },
    ];

    await this.approachTypeRepository.save(approachTypes);
    console.log('🎯 Approach types seeded');
  }

  private async seedProcessTypes() {
    const count = await this.processTypeRepository.count();
    if (count > 0) return;

    const processTypes = [
      {
        name: 'Proceso Individual',
        description: 'Proceso terapéutico con atención personalizada uno a uno',
      },
      {
        name: 'Proceso Grupal',
        description: 'Proceso terapéutico en formato de grupo',
      },
      {
        name: 'Proceso Familiar',
        description: 'Proceso terapéutico enfocado en la dinámica familiar',
      },
      {
        name: 'Proceso de Pareja',
        description: 'Proceso terapéutico para relaciones de pareja',
      },
      {
        name: 'Proceso de Evaluación',
        description: 'Proceso diagnóstico y valoración psicológica',
      },
      {
        name: 'Proceso Psicoeducativo',
        description: 'Proceso enfocado en educación sobre salud mental',
      },
      {
        name: 'Proceso de Acompañamiento',
        description: 'Proceso de seguimiento y apoyo continuo',
      },
    ];

    await this.processTypeRepository.save(processTypes);
    console.log('⚙️ Process types seeded');
  }

  private async seedTreatmentStatuses() {
    const count = await this.treatmentStatusRepository.count();
    if (count > 0) return;

    const treatmentStatuses = [
      { name: 'Sí', code: 'SI' },
      { name: 'No', code: 'NO' },
    ];

    await this.treatmentStatusRepository.save(treatmentStatuses);
    console.log('💊 Treatment statuses seeded');
  }
}
