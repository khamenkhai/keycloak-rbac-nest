import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { KeycloakService } from '../keycloak/keycloak.service';
import { CreateRoleDto } from './dto/create-role.dto';

@ApiTags('Client Roles')
@Controller('client-roles')
export class ClientRolesController {
  constructor(private readonly keycloak: KeycloakService) { }

  @Get()
  @ApiOperation({ summary: 'List all roles for a client (defaults to configured client)' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Internal UUID of the client. If omitted, uses default from configuration.' })
  @ApiResponse({ status: 200, description: 'List of client roles.' })
  async findAll(@Query('clientId') clientId?: string) {
    return this.keycloak.clients.listRoles({ id: clientId || "" });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role for a client' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Internal UUID of the client.' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Client role created successfully.' })
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @Query('clientId') clientId?: string,
  ) {
    return this.keycloak.clients.createRole({ id: clientId, ...createRoleDto });
  }

  @Put(':roleName')
  @ApiOperation({ summary: 'Update a specific role for a client' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Internal UUID of the client.' })
  @ApiParam({ name: 'roleName', description: 'Name of the role to update' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 200, description: 'Client role updated successfully.' })
  async update(
    @Param('roleName') roleName: string,
    @Body() updateDto: CreateRoleDto,
    @Query('clientId') clientId?: string,
  ) {
    return this.keycloak.clients.updateRole(
      { id: clientId || "", roleName },
      updateDto as any,
    );
  }

  @Delete(':roleName')
  @ApiOperation({ summary: 'Delete a specific role for a client' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Internal UUID of the client.' })
  @ApiParam({ name: 'roleName', description: 'Name of the role to delete' })
  @ApiResponse({ status: 204, description: 'Client role deleted successfully.' })
  async remove(
    @Param('roleName') roleName: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.keycloak.clients.delRole({ id: clientId || "", roleName });
  }
}
