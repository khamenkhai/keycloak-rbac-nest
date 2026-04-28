import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { KeycloakService } from '../keycloak.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { ClientIdDto } from '../dto/client-id.dto';
import { KeycloakAuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Client Roles')
@UseGuards(KeycloakAuthGuard)
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
  async findAll(@Query() query: ClientIdDto) {
    const clientId = this.getClientId(query.clientId);

    console.log(`client id => ${clientId}`);

    return this.keycloak.clients.listRoles({ id: clientId });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role for a client' })
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
  async update(
    @Param('roleName') roleName: string,
    @Body() updateDto: CreateRoleDto,
    @Query() query: ClientIdDto,
  ) {
    const clientId = this.getClientId(query.clientId);

    return this.keycloak.clients.updateRole(
      { id: clientId, roleName },
      updateDto,
    );
  }

  @Delete(':roleName')
  @ApiOperation({ summary: 'Delete a specific role for a client' })
  @ApiParam({
    name: 'roleName',
    description: 'Name of the role to delete',
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
