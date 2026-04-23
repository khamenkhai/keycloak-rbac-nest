import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({
    example: 'my-frontend-app',
    description: 'The unique ID of the client',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 'My Web Application', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ example: 'openid-connect', default: 'openid-connect' })
  @IsOptional()
  @IsString()
  protocol?: string;

  @ApiProperty({
    example: ['http://localhost:3000/*'],
    description: 'Valid redirect URIs after login',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  redirectUris?: string[];

  @ApiProperty({
    example: false,
    description: 'If true, this client requires a secret',
  })
  @IsOptional()
  @IsBoolean()
  publicClient?: boolean;
}
