import { SetMetadata } from '@nestjs/common';

export const CLIENT_ROLES_KEY = 'client_roles';

export const ClientRoles = (...roles: string[]) =>
  SetMetadata(CLIENT_ROLES_KEY, roles);
