import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { Clients } from '@keycloak/keycloak-admin-client/lib/resources/clients';
import { Users } from '@keycloak/keycloak-admin-client/lib/resources/users';
import { Roles } from '@keycloak/keycloak-admin-client/lib/resources/roles';
import { Realms } from '@keycloak/keycloak-admin-client/lib/resources/realms';
import { Groups } from '@keycloak/keycloak-admin-client/lib/resources/groups';

@Injectable()
export class KeycloakService implements OnModuleInit {
  private readonly logger = new Logger(KeycloakService.name);
  private kcAdminClient: KeycloakAdminClient;
  private authPromise: Promise<void> | null = null;

  constructor(private readonly configService: ConfigService) {
    this.kcAdminClient = new KeycloakAdminClient({
      baseUrl: this.configService
        .getOrThrow<string>('KEYCLOAK_BASE_URL')
        .replace(/\/$/, ''),
      realmName: this.configService.getOrThrow<string>('KEYCLOAK_REALM_NAME'),
    });
  }

  async onModuleInit() {
    await this.authenticate();
  }

  // Getters with "Ensure Authenticated" logic
  get users(): Users {
    return this.getResourceWithRealm(this.kcAdminClient.users);
  }
  get realms(): Realms {
    return this.getResourceWithRealm(this.kcAdminClient.realms);
  }
  get clients(): Clients {
    return this.getResourceWithRealm(this.kcAdminClient.clients, 'clients');
  }
  get groups(): Groups {
    return this.getResourceWithRealm(this.kcAdminClient.groups);
  }
  get roles(): Roles {
    return this.getResourceWithRealm(this.kcAdminClient.roles);
  }

  private getResourceWithRealm(resource: any, resourceName?: string) {
    const targetRealm =
      this.configService.get<string>('KEYCLOAK_REALM') ||
      this.configService.get('KEYCLOAK_REALM_NAME');
    const defaultClientId = this.configService.get<string>(
      'KEYCLOAK_DEFAULT_CLIENT_UUID',
    );

    return new Proxy(resource, {
      get: (target, prop) => {
        const original = target[prop];
        if (typeof original === 'function') {
          return async (...args: any[]) => {
            // CRITICAL FIX: Ensure token is valid before EVERY call
            await this.authenticate();

            const payload = args[0] || {};
            if (typeof payload === 'object') {
              if (!payload.realm) payload.realm = targetRealm;

              if (
                resourceName === 'clients' &&
                (!payload.id || payload.id === '') &&
                defaultClientId
              ) {
                payload.id = defaultClientId;
              }

              const collectionMethods = ['list', 'find', 'create'];
              if (
                resourceName === 'clients' &&
                !collectionMethods.includes(String(prop)) &&
                (!payload.id || payload.id === '')
              ) {
                throw new Error(
                  `Client ID (UUID) required for '${String(prop)}'`,
                );
              }
            }
            return original.apply(target, [payload, ...args.slice(1)]);
          };
        }
        return original;
      },
    });
  }

  private async authenticate() {
    // 1. Check if token is still valid (using internal state of kcAdminClient)
    // If we have a token and it's not expired (giving 10s buffer), skip
    if (this.kcAdminClient.accessToken && !this.isTokenExpired()) {
      return;
    }

    // 2. If already authenticating, wait for that promise instead of starting a new one
    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = (async () => {
      try {
        const grantType = this.configService.get<string>(
          'KEYCLOAK_GRANT_TYPE',
          'client_credentials',
        );
        const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
        const clientSecret = this.configService.get<string>(
          'KEYCLOAK_CLIENT_SECRET',
        );
        const authRealm = this.configService.get<string>(
          'KEYCLOAK_AUTH_REALM',
          'master',
        );

        this.kcAdminClient.setConfig({ realmName: authRealm });

        const authConfig: any = {
          grantType,
          clientId,
          clientSecret,
          realmName: authRealm,
        };

        if (grantType === 'password') {
          authConfig.username = this.configService.get('KEYCLOAK_USERNAME');
          authConfig.password = this.configService.get('KEYCLOAK_PASSWORD');
        }

        await this.kcAdminClient.auth(authConfig);

        // Reset to functional realm
        this.kcAdminClient.setConfig({
          realmName: this.configService.get('KEYCLOAK_REALM_NAME'),
        });

        this.logger.log('Keycloak token refreshed successfully.');
      } catch (error) {
        this.logger.error(`Keycloak Auth Failed: ${error.message}`);
        throw error;
      } finally {
        this.authPromise = null; // Release the lock
      }
    })();

    return this.authPromise;
  }

  private isTokenExpired(): boolean {
    if (!this.kcAdminClient.accessToken) return true;
    try {
      // Decode JWT payload (atob is available in Node 16+)
      const base64Url = this.kcAdminClient.accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString());

      // Check 'exp' claim (current time + 10 second buffer)
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime + 10;
    } catch {
      return true;
    }
  }
}
