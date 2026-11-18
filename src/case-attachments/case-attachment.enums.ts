/** Sección del expediente a la que pertenece el documento. */
export enum AttachmentContext {
  /** Documentación y Consentimientos (inicio del caso o consulta breve). */
  CONSENT = 'CONSENT',
  /** Plan a Seguir – "Se hará un referido". */
  FOLLOW_UP_REFERRAL = 'FOLLOW_UP_REFERRAL',
  /** Módulo de Referidos (paso 12). */
  REFERRAL = 'REFERRAL',
}

export enum AttachmentCategory {
  RELEASE_OF_LIABILITY = 'RELEASE_OF_LIABILITY',
  CONFIDENTIALITY = 'CONFIDENTIALITY',
  PARTICIPATION_CONSENT = 'PARTICIPATION_CONSENT',
  DATA_AUTHORIZATION = 'DATA_AUTHORIZATION',
  REFERRAL_FORM = 'REFERRAL_FORM',
  REFERRAL_RESPONSE = 'REFERRAL_RESPONSE',
  SUPPORT_DOCUMENT = 'SUPPORT_DOCUMENT',
  OTHER = 'OTHER',
}

const CONSENT_CATEGORIES = [
  AttachmentCategory.RELEASE_OF_LIABILITY,
  AttachmentCategory.CONFIDENTIALITY,
  AttachmentCategory.PARTICIPATION_CONSENT,
  AttachmentCategory.DATA_AUTHORIZATION,
  AttachmentCategory.OTHER,
];

const REFERRAL_CATEGORIES = [
  AttachmentCategory.REFERRAL_FORM,
  AttachmentCategory.REFERRAL_RESPONSE,
  AttachmentCategory.SUPPORT_DOCUMENT,
  AttachmentCategory.OTHER,
];

export const CATEGORIES_BY_CONTEXT: Record<
  AttachmentContext,
  AttachmentCategory[]
> = {
  [AttachmentContext.CONSENT]: CONSENT_CATEGORIES,
  [AttachmentContext.FOLLOW_UP_REFERRAL]: REFERRAL_CATEGORIES,
  [AttachmentContext.REFERRAL]: REFERRAL_CATEGORIES,
};

export enum AttachmentStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export enum AttachmentAction {
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  DELETE = 'DELETE',
}
