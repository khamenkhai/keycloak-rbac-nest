import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { KeycloakService } from '../keycloak.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { KeycloakAuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Roles')
@UseGuards(KeycloakAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly keycloak: KeycloakService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user-defined roles from Keycloak' })
  async findAll() {
    const allRoles = await this.keycloak.roles.find();
    const defaultRoles = [
      'offline_access',
      'uma_authorization',
      'default-roles-master',
    ];

    return allRoles.filter(
      (role) =>
        !defaultRoles.includes(role.name || '') &&
        !(role.name || '').startsWith('default-roles-'),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific role by its ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the role',
    example: '1234-abcd-...',
  })
  async findOne(@Param('id') id: string) {
    return this.keycloak.roles.findOneById({ id });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role in Keycloak' })
  @ApiBody({ type: CreateRoleDto })
  async create(@Body() roleRepresentation: CreateRoleDto) {
    return this.keycloak.roles.create(roleRepresentation);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing role by ID' })
  @ApiParam({ name: 'id', description: 'The UUID of the role to update' })
  async update(@Param('id') id: string, @Body() updateRoleDto: CreateRoleDto) {
    await this.keycloak.roles.updateById({ id }, updateRoleDto);

    return { message: `Role with ID ${id} updated successfully` };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role from Keycloak by ID' })
  @ApiParam({ name: 'id', description: 'The UUID of the role to delete' })
  async remove(@Param('id') id: string) {
    await this.keycloak.roles.delById({ id });
  }
}
