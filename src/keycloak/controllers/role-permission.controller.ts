import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { KeycloakService } from '../keycloak.service';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import { AssignPermissionsDto } from '../dto/assign-permission.dto';
import { KeycloakAuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Role Permissions')
@UseGuards(KeycloakAuthGuard)
@Controller('roles/:realmRoleId/permissions')
export class RolePermissionsController {
  constructor(private readonly keycloak: KeycloakService) {}

  @Post()
  @ApiOperation({
    summary: 'Assign client roles (permissions) to a realm role',
  })
  async assignPermissions(@Body() dto: AssignPermissionsDto) {
    await this.keycloak.roles.createComposite(
      { roleId: dto.realmRoleId },
      dto.permissions,
    );

    return { message: 'Permissions assigned successfully' };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all client roles (permissions) assigned to a realm role',
  })
  @ApiParam({
    name: 'realmRoleId',
    description: 'The UUID of the REALM ROLE',
  })
  async getPermissions(@Param('realmRoleId') realmRoleId: string) {
    return this.keycloak.roles.getCompositeRoles({ id: realmRoleId });
  }

  @Get('client-roles')
  @ApiOperation({
    summary:
      'Get client roles (only) assigned to a realm role (optionally filtered by client)',
  })
  @ApiParam({
    name: 'realmRoleId',
    description: 'The UUID of the REALM ROLE',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description:
      'Optional client UUID; when provided, returns only composites from that client',
  })
  async getClientRolePermissions(
    @Param('realmRoleId') realmRoleId: string,
    @Query('clientId') clientId?: string,
  ) {
    if (clientId) {
      return this.keycloak.roles.getCompositeRolesForClient({
        id: realmRoleId,
        clientId,
      });
    }

    const allComposites = await this.keycloak.roles.getCompositeRoles({
      id: realmRoleId,
    });
    return allComposites.filter((role) => role.clientRole === true);
  }

  @Delete()
  @ApiOperation({
    summary: 'Remove client roles (permissions) from a realm role',
  })
  @ApiParam({
    name: 'realmRoleId',
    description: 'The UUID of the REALM ROLE',
  })
  async unassignPermissions(
    @Param('realmRoleId') realmRoleId: string,
    @Body() permissions: RoleRepresentation[],
  ) {
    await this.keycloak.roles.delCompositeRoles(
      { id: realmRoleId },
      permissions,
    );

    return { message: 'Permissions removed successfully' };
  }
}
