import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { KeycloakService } from '../keycloak/keycloak.service';
import { CreateClientDto } from './dto/client-dto';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly keycloak: KeycloakService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clients in the configured realm' })
  @ApiResponse({
    status: 200,
    description: 'List of clients retrieved successfully.',
  })
  async findAll() {
    return this.keycloak.clients.find();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific client by its internal UUID' })
  @ApiParam({
    name: 'id',
    description: 'The internal UUID of the client (not the clientId)',
    example: '37f283d0-fc24-4d14-bd02-63afc32f0024',
  })
  @ApiResponse({ status: 200, description: 'Client found.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  async findOne(@Param('id') id: string) {
    return this.keycloak.clients.findOne({ id });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Client created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid client configuration.',
  })
  async create(@Body() clientRepresentation: CreateClientDto) {
    // Note: your Proxy in KeycloakService will automatically inject the realm
    return this.keycloak.clients.create(clientRepresentation);
  }
}
