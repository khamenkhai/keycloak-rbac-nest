import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { KeycloakService } from '../keycloak/keycloak.service';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import { AssignPermissionsDto } from './dto/assign-permission.dto';

@ApiTags('Role Permissions')
@Controller('roles/:id/permissions')
export class RolePermissionsController {
    constructor(private readonly keycloak: KeycloakService) { }

    @Post()
    @ApiOperation({ summary: 'Assign permissions to a realm role' })
    @ApiParam({ name: 'id', description: 'The UUID of the Realm Role' })
    @ApiResponse({ status: 201, description: 'Permissions assigned successfully.' })
    async assignPermissions(
        @Param('id') id: string,
        @Body() body: AssignPermissionsDto
    ) {

        await this.keycloak.roles.createComposite(
            { roleId: id },
            body.permissions
        );
        return { message: 'Permissions assigned successfully' };
    }

    @Get()
    @ApiOperation({ summary: 'Get all permissions (client roles) assigned to a role' })
    @ApiParam({ name: 'id', description: 'The UUID of the Realm Role' })
    async getPermissions(@Param('id') id: string) {
        return this.keycloak.roles.getCompositeRoles({ id });
    }

    @Delete()
    @ApiOperation({ summary: 'Unassign permissions from a role' })
    @ApiParam({ name: 'id', description: 'The UUID of the Realm Role' })
    async unassignPermissions(
        @Param('id') id: string,
        @Body() permissions: RoleRepresentation[]
    ) {
        await this.keycloak.roles.delCompositeRoles({ id }, permissions);
        return { message: 'Permissions removed successfully' };
    }
}