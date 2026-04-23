import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { KeycloakService } from '../keycloak/keycloak.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ClientIdDto } from './dto/client-id.dto';

@ApiTags('Client Roles')
@Controller('client-roles')
export class ClientRolesController {
  constructor(
    private readonly keycloak: KeycloakService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Helper to resolve clientId
   */
  private getClientId(clientId?: string): string {
    return (
      clientId ||
      this.configService.get<string>('KEYCLOAK_DEFAULT_CLIENT_UUID')!
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List all roles for a client (default client if not provided)',
  })
  @ApiResponse({ status: 200, description: 'List of client roles.' })
  async findAll(@Query() query: ClientIdDto) {
    const clientId = this.getClientId(query.clientId);

    console.log(`client id => ${clientId}`);

    return this.keycloak.clients.listRoles({ id: clientId });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role for a client' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Client role created successfully.',
  })
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @Query() query: ClientIdDto,
  ) {
    const clientId = this.getClientId(query.clientId);

    return this.keycloak.clients.createRole({
      id: clientId,
      ...createRoleDto,
    });
  }

  @Put(':roleName')
  @ApiOperation({ summary: 'Update a specific role for a client' })
  @ApiParam({
    name: 'roleName',
    description: 'Name of the role to update',
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Client role updated successfully.',
  })
  async update(
    @Param('roleName') roleName: string,
    @Body() updateDto: CreateRoleDto,
    @Query() query: ClientIdDto,
  ) {
    const clientId = this.getClientId(query.clientId);

    return this.keycloak.clients.updateRole(
      { id: clientId, roleName },
      updateDto as any,
    );
  }

  @Delete(':roleName')
  @ApiOperation({ summary: 'Delete a specific role for a client' })
  @ApiParam({
    name: 'roleName',
    description: 'Name of the role to delete',
  })
  @ApiResponse({
    status: 204,
    description: 'Client role deleted successfully.',
  })
  async remove(
    @Param('roleName') roleName: string,
    @Query() query: ClientIdDto,
  ) {
    const clientId = this.getClientId(query.clientId);

    return this.keycloak.clients.delRole({
      id: clientId,
      roleName,
    });
  }
}
