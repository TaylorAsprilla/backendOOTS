export class CreateParticipantDto {
  firstName: string;
  secondName?: string;
  firstLastName: string;
  secondLastName?: string;
  phoneNumber: string;
  email: string;
  documentTypeId: string;
  documentNumber: string;
  address: string;
  city: string;
  birthDate: string;
  religiousAffiliation?: string;
  genderId: string;
  maritalStatusId: string;
  healthInsuranceId: string;
  customHealthInsurance?: string;
  referralSource?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail?: string;
  emergencyContactAddress?: string;
  emergencyContactCity?: string;
  emergencyContactRelationship: string;
}

export class UpdateParticipantDto {
  firstName?: string;
  secondName?: string;
  firstLastName?: string;
  secondLastName?: string;
  phoneNumber?: string;
  email?: string;
  documentTypeId?: string;
  documentNumber?: string;
  address?: string;
  city?: string;
  birthDate?: string;
  religiousAffiliation?: string;
  genderId?: string;
  maritalStatusId?: string;
  healthInsuranceId?: string;
  customHealthInsurance?: string;
  referralSource?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  emergencyContactAddress?: string;
  emergencyContactCity?: string;
  emergencyContactRelationship?: string;
}

export class SearchParticipantsDto {
  q?: string;
  city?: string;
  gender?: string;
  maritalStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}
