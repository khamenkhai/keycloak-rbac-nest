import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin', description: 'The unique name of the role' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'admin role for client',
    description: 'Description of the role',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
