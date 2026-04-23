import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ClientRolePermissionDto {
  @ApiProperty({
    description: 'UUID of the CLIENT ROLE (permission)',
    example: '9ddd2dd7-2d2b-4189-8c75-5d19eac19c0a',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Name of the CLIENT ROLE',
    example: 'manage:shop',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'UUID of the REALM ROLE (parent role)',
    example: '9ddd2dd7-2d2b-4189-8c75-5d19eac19c0a',
  })
  @IsString()
  @IsNotEmpty()
  realmRoleId: string;

  @ApiProperty({
    type: [ClientRolePermissionDto],
    description:
      'List of CLIENT ROLES (permissions) to assign to the realm role',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientRolePermissionDto)
  permissions: ClientRolePermissionDto[];
}
