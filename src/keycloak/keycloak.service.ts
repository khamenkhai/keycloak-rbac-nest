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
  public client: KeycloakAdminClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new KeycloakAdminClient({
      baseUrl: this.configService.get<string>('KEYCLOAK_BASE_URL'),
      realmName: this.configService.get<string>(
        'KEYCLOAK_AUTH_REALM',
        'master',
      ),
    });
  }

  // Getters for proxy-wrapped resources that automatically inject the target realm and optionally a default client ID
  get users(): Users {
    return this.getResourceWithRealm(this.client.users);
  }
  get realms(): Realms {
    return this.getResourceWithRealm(this.client.realms);
  }
  get clients(): Clients {
    return this.getResourceWithRealm(this.client.clients, 'clients');
  }
  get groups(): Groups {
    return this.getResourceWithRealm(this.client.groups);
  }
  get roles(): Roles {
    return this.getResourceWithRealm(this.client.roles);
  }

  private getResourceWithRealm(resource: any, resourceName?: string) {
    const targetRealm = this.configService.get<string>('KEYCLOAK_REALM');
    const defaultClientId = this.configService.get<string>(
      'KEYCLOAK_DEFAULT_CLIENT_UUID',
    );

    return new Proxy(resource, {
      get: (target, prop) => {
        const original = target[prop];
        if (typeof original === 'function') {
          return (...args: any[]) => {
            // Inject realm into the first argument (payload) if it's an object
            const payload = args[0] || {};
            if (typeof payload === 'object') {
              if (!payload.realm) {
                payload.realm = targetRealm;
              }

              // Inject default client ID for client-related operations if 'id' is missing
              if (
                resourceName === 'clients' &&
                !payload.id &&
                defaultClientId
              ) {
                payload.id = defaultClientId;
              }
            }
            return original.apply(target, [payload, ...args.slice(1)]);
          };
        }
        return original;
      },
    });
  }

  async getClient() {
    await this.authenticate();
    return this.client;
  }

  async onModuleInit() {
    await this.authenticate();
  }

  private async authenticate() {
    try {
      const grantType = this.configService.get<string>(
        'KEYCLOAK_GRANT_TYPE',
        'password',
      );
      const clientId = this.configService.get<string>(
        'KEYCLOAK_CLIENT_ID',
        'admin-cli',
      );
      const clientSecret = this.configService.get<string>(
        'KEYCLOAK_CLIENT_SECRET',
      );
      const authRealm = this.configService.get<string>(
        'KEYCLOAK_AUTH_REALM',
        'master',
      );

      if (grantType === 'password') {
        await this.client.auth({
          username: this.configService.get<string>('KEYCLOAK_USERNAME'),
          password: this.configService.get<string>('KEYCLOAK_PASSWORD'),
          grantType: 'password',
          clientId: clientId,
          clientSecret: clientSecret,
        });
        this.logger.log(
          `Authenticated to Keycloak using password grant on realm ${authRealm}`,
        );
      } else {
        await this.client.auth({
          grantType: 'client_credentials',
          clientId: clientId,
          clientSecret: clientSecret,
        });
        this.logger.log(
          `Authenticated to Keycloak using client_credentials grant on realm ${authRealm}`,
        );
      }

      if (!this.client.accessToken) {
        throw new Error('Access token is missing after authentication');
      }
    } catch (error) {
      this.logger.error(
        `Failed to authenticate with Keycloak: ${error.message}`,
      );
    }
  }
}
