import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ClientIdDto {
  @ApiPropertyOptional({
    example: '37f283d0-fc24-4d14-bd02-63afc32f0024',
    description:
      'Client internal UUID. If not provided, default client ID from env will be used.',
  })
  @IsOptional()
  @IsString()
  clientId?: string;
}
