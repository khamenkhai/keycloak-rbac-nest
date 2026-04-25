import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KeycloakModule } from './keycloak/keycloak.module';
import { UsersController } from './keycloak/controllers/users.controller';
import { RolesController } from './keycloak/controllers/roles.controller';
import { ClientRolesController } from './keycloak/controllers/client-roles.controller';
import { KeycloakExceptionFilter } from './keycloak/keycloak-exception.filter';
import { ClientsController } from './keycloak/controllers/clients.controller';
import { RolePermissionsController } from './keycloak/controllers/role-permission.controller';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ExampleModule } from './modules/example/example.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
    }),
    KeycloakModule,
    AuthModule,
    ExampleModule,
  ],
  controllers: [
    AppController,
    UsersController,
    RolesController,
    ClientRolesController,
    ClientsController,
    RolePermissionsController,
  ],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: KeycloakExceptionFilter,
    },
  ],
})
export class AppModule {}
