import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KeycloakModule } from './keycloak/keycloak.module';
import { UsersController } from './controllers/users.controller';
import { RolesController } from './controllers/roles.controller';
import { ClientRolesController } from './controllers/client-roles.controller';
import { KeycloakExceptionFilter } from './keycloak/keycloak-exception.filter';
import { ClientsController } from './controllers/clients.controller';
import { RolePermissionsController } from './controllers/role-permission.controller';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KeycloakModule,
    AuthModule,
  ],
  controllers: [
    AppController,
    UsersController,
    RolesController,
    ClientRolesController,
    ClientsController,
    RolePermissionsController
  ],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: KeycloakExceptionFilter,
    },
  ],
})
export class AppModule { }
