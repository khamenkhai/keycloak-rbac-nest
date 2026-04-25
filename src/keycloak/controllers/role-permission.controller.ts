import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { KeycloakService } from '../keycloak.service';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import { AssignPermissionsDto } from '../dto/assign-permission.dto';

@ApiTags('Role Permissions')
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
