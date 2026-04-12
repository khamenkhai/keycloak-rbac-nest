import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { KeycloakService } from "src/keycloak/keycloak.service";
import { AssignClientRolesDto, CreateUserDto, UserRoleMappingDto } from "./dto/user.dto";

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly keycloak: KeycloakService) { }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(@Query('first') first?: number, @Query('max') max?: number) {
    return this.keycloak.users.find({ first, max });
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user by internal UUID' })
  @ApiParam({ name: 'userId', description: 'The UUID of the user' })
  async findOne(@Param('userId') id: string) {
    return this.keycloak.users.findOne({ id });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.keycloak.users.create(createUserDto);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update user details' })
  async update(@Param('userId') id: string, @Body() updateUserDto: any) {
    return this.keycloak.users.update({ id }, updateUserDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete a user' })
  async remove(@Param('userId') id: string) {
    return this.keycloak.users.del({ id });
  }

  /**
   * ROLE MAPPINGS
   * Note: Keycloak docs use 'clientUniqueId' for the internal UUID of the client
   */

  @Get(':userId/role-mappings/clients/:clientUuid')
  @ApiOperation({ summary: 'List client roles assigned to a user' })
  @ApiParam({ name: 'userId', description: 'Internal UUID of the user' })
  @ApiParam({ name: 'clientUuid', description: 'Internal UUID (not Client ID) of the client' })
  async findClientRoleMappings(
    @Param('userId') id: string,
    @Param('clientUuid') clientUniqueId: string,
  ) {
    return this.keycloak.users.listClientRoleMappings({
      id,
      clientUniqueId
    });
  }

  @Post('role-mappings/clients')
  @ApiOperation({ summary: 'Assign client roles to a user via Body' })
  async addClientRoleMappings(
    @Body() dto: AssignClientRolesDto,
  ) {
    const response = await this.keycloak.users.addClientRoleMappings({
      id: dto.userId,
      clientUniqueId: dto.clientUuid,
      roles: dto.roles.map(role => ({
        id: role.roleId,
        name: role.roleName
      }))
    });

    const manualResponse = {
      status: 'success',
      message: 'Roles mapped successfully! 🎊',
      timestamp: new Date().toISOString(),
      details: {
        targetUser: dto.userId,
        targetClient: dto.clientUuid,
        rolesAdded: dto.roles.map(r => r.roleName)
      }
    };

    return manualResponse;
  }

  @Delete(':userId/role-mappings/clients/:clientUuid')
  @ApiOperation({ summary: 'Remove client roles from a user' })
  @ApiBody({ type: [UserRoleMappingDto] })
  async removeClientRoleMappings(
    @Param('userId') id: string,
    @Param('clientUuid') clientUniqueId: string,
    @Body() roles: UserRoleMappingDto[],
  ) {
    const data = await this.keycloak.users.delClientRoleMappings({
      id: id,
      clientUniqueId: clientUniqueId,
      roles: roles.map(role => ({
        id: role.roleId,
        name: role.roleName
      }))
    });

    const auditResponse = {
      status: 'removed',
      message: 'Roles detached successfully 💨',
      target: {
        user: id,
        client: clientUniqueId
      },
      removedRoles: roles.map(r => r.roleName),
      timestamp: new Date().toISOString()
    };

    return auditResponse;
  }
}