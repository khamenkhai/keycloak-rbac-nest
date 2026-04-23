import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeycloakService } from '../keycloak/keycloak.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly keycloak: KeycloakService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const baseUrl = this.configService
      .getOrThrow<string>('KEYCLOAK_BASE_URL')
      .replace(/\/$/, '');
    const realm = this.configService.getOrThrow<string>('KEYCLOAK_REALM_NAME');
    const clientId =
      this.configService.getOrThrow<string>('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>(
      'KEYCLOAK_CLIENT_SECRET',
    );

    const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('username', loginDto.username);
    params.append('password', loginDto.password);

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new UnauthorizedException(
          data.error_description || 'Invalid credentials',
        );
      }

      return data;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Login failed: ${error.message}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const { password, ...userData } = registerDto;

      // Create user
      const user = await this.keycloak.users.create({
        ...userData,
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false,
          },
        ],
      });

      return {
        message: 'User registered successfully',
        userId: (user as any).id,
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to register user');
    }
  }
}
