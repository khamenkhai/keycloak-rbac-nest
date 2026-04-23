import { SetMetadata } from '@nestjs/common';

export const REALM_ROLES_KEY = 'realm_roles';

export const RealmRoles = (...roles: string[]) =>
  SetMetadata(REALM_ROLES_KEY, roles);
