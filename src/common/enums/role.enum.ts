export enum Role {
  ADMIN = 'ADMIN',
  ADMIN_COUNTRY = 'ADMIN_COUNTRY',
  USER = 'USER',
  COORDINADOR = 'COORDINADOR',
  SUPERVISOR = 'SUPERVISOR',
  PSICOLOGO = 'PSICOLOGO',
  ORIENTADOR = 'ORIENTADOR',
  TRABAJO_SOCIAL = 'TRABAJO_SOCIAL',
}

/** Roles que pueden recibir un caso transferido (profesionales que atienden casos). */
export const CASE_ASSIGNABLE_ROLES: Role[] = [
  Role.PSICOLOGO,
  Role.ORIENTADOR,
  Role.TRABAJO_SOCIAL,
  Role.COORDINADOR,
  Role.SUPERVISOR,
];
