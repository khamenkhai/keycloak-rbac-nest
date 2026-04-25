import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  private readonly jwksUri =
    'http://localhost:8080/realms/POS/protocol/openid-connect/certs';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('No token found');

    if (this.isMockEnabled()) {
      request['user'] = this.buildMockUser(request);
      return true;
    }

    try {
      // 1. Manually decode the header to get the "kid" (Key ID)
      const decodedToken: any = jwt.decode(token, { complete: true });
      if (!decodedToken || !decodedToken.header.kid) {
        throw new UnauthorizedException('Invalid token metadata');
      }

      // 2. Fetch the correct public key from Keycloak using the "kid"
      const jwksRsa: any = await import('jwks-rsa');
      const client = new jwksRsa.JwksClient({ jwksUri: this.jwksUri });
      const keySet = await client.getSigningKeys();
      const signingKey = keySet.find((k) => k.kid === decodedToken.header.kid);

      if (!signingKey) {
        throw new UnauthorizedException('Public key not found for this token');
      }

      const publicKey = signingKey.getPublicKey();

      // 3. Verify the token using the fetched key
      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: publicKey,
        algorithms: ['RS256'],
      });

      request['user'] = payload;
      return true;
    } catch (error) {
      console.error('Auth Error:', error.message);
      throw new UnauthorizedException('Invalid Keycloak token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isMockEnabled(): boolean {
    return (process.env.MOCK_KEYCLOAK_AUTH || '').toLowerCase() === 'true';
  }

  private buildMockUser(request: Request) {
    const rawClaims = this.getHeader(request, 'x-mock-claims');
    if (rawClaims) {
      const parsed = this.tryParseJson(rawClaims) ?? this.tryParseBase64Json(rawClaims);
      if (parsed && typeof parsed === 'object') return parsed;
    }

    const clientName = process.env.KEYCLOAK_CLIENT_ID || 'mock-client';

    const username =
      this.getHeader(request, 'x-mock-username') ||
      process.env.MOCK_KEYCLOAK_USERNAME ||
      'mock-user';

    const realmRoles = this.parseCsv(
      this.getHeader(request, 'x-mock-realm-roles') ||
        process.env.MOCK_KEYCLOAK_REALM_ROLES ||
        '',
    );

    const clientRoles = this.parseCsv(
      this.getHeader(request, 'x-mock-client-roles') ||
        process.env.MOCK_KEYCLOAK_CLIENT_ROLES ||
        '',
    );

    return {
      sub: 'mock-sub',
      preferred_username: username,
      realm_access: { roles: realmRoles },
      resource_access: {
        [clientName]: { roles: clientRoles },
      },
    };
  }

  private getHeader(request: Request, headerName: string): string | undefined {
    const raw = request.headers[headerName.toLowerCase()];
    if (typeof raw === 'string') return raw;
    if (Array.isArray(raw)) return raw[0];
    return undefined;
  }

  private parseCsv(value: string): string[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private tryParseJson(value: string): any | undefined {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  private tryParseBase64Json(value: string): any | undefined {
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch {
      return undefined;
    }
  }
}
