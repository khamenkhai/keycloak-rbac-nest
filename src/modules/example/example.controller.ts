import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import express from 'express';
import {
  Permissions,
  Roles,
} from 'src/common/decorators/role-permission.decorator';
import { KeycloakAuthGuard } from 'src/common/guards/auth.guard';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ExampleService } from './example.service';

@ApiTags('Example (Guards)')
@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get('public')
  @ApiOperation({ summary: 'Unprotected endpoint' })
  publicEndpoint() {
    return {
      ok: true,
      guard: 'none',
      data: this.exampleService.getPublicPayload(),
    };
  }

  @Get('auth')
  @ApiBearerAuth()
  @UseGuards(KeycloakAuthGuard)
  @ApiOperation({ summary: 'Protected by KeycloakAuthGuard' })
  authOnly(@Req() req: express.Request) {
    return {
      ok: true,
      guard: 'KeycloakAuthGuard',
      data: {
        ...this.exampleService.getAuthenticatedPayload(),
        user: (req as any).user ?? null,
      },
    };
  }

  @Get('roles/admin')
  @ApiBearerAuth()
  @UseGuards(KeycloakAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Requires realm role: admin' })
  requiresAdminRole(@Req() req: express.Request) {
    return {
      ok: true,
      guard: 'KeycloakAuthGuard + RolesGuard',
      required: { realmRoles: ['admin'] },
      data: {
        ...this.exampleService.getRoleProtectedPayload(),
        user: (req as any).user ?? null,
      },
    };
  }

  @Get('permissions/read')
  @ApiBearerAuth()
  @UseGuards(KeycloakAuthGuard, PermissionsGuard)
  @Permissions('read')
  @ApiOperation({ summary: 'Requires client permission: read' })
  requiresReadPermission(@Req() req: express.Request) {
    return {
      ok: true,
      guard: 'KeycloakAuthGuard + PermissionsGuard',
      required: { clientPermissions: ['read'] },
      data: {
        ...this.exampleService.getPermissionProtectedPayload(),
        user: (req as any).user ?? null,
      },
    };
  }

  @Get('roles-and-permissions')
  @ApiBearerAuth()
  @UseGuards(KeycloakAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('manager')
  @Permissions('write')
  @ApiOperation({
    summary: 'Requires realm role: manager AND client permission: write',
  })
  requiresManagerAndWrite(@Req() req: express.Request) {
    return {
      ok: true,
      guard: 'KeycloakAuthGuard + RolesGuard + PermissionsGuard',
      required: { realmRoles: ['manager'], clientPermissions: ['write'] },
      data: {
        ...this.exampleService.getRoleAndPermissionProtectedPayload(),
        user: (req as any).user ?? null,
      },
    };
  }
}
