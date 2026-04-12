import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({ example: 'admin', description: 'The unique name of the role' })
    name: string;

    @ApiProperty({ example: 'Administrator role with full access', required: false })
    description?: string;
}