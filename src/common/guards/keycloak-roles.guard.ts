import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CLIENT_ROLES_KEY } from '../decorators/client-role.decorator';
import { REALM_ROLES_KEY } from '../decorators/realmn-role.decorator';

@Injectable()
export class KeycloakRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredClientRoles = this.reflector.getAllAndOverride<string[]>(
      CLIENT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRealmRoles = this.reflector.getAllAndOverride<string[]>(
      REALM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles required → allow access
    if (!requiredClientRoles && !requiredRealmRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('No user in request');
    }

    const clientId = process.env.KEYCLOAK_CLIENT_ID || '';

    const clientRoles = user?.resource_access?.[clientId]?.roles ?? [];

    const realmRoles = user?.realm_access?.roles ?? [];

    // Check client roles
    const hasClientRole =
      !requiredClientRoles ||
      requiredClientRoles.some((role) => clientRoles.includes(role));

    // Check realm roles
    const hasRealmRole =
      !requiredRealmRoles ||
      requiredRealmRoles.some((role) => realmRoles.includes(role));

    if (!hasClientRole || !hasRealmRole) {
      throw new UnauthorizedException('Insufficient role');
    }

    return true;
  }
}
