import { ApiProperty } from '@nestjs/swagger';

export class PermissionItemDto {
    @ApiProperty({
        description: 'The unique UUID of the client role (permission)',
        example: '9ddd2dd7-2d2b-4189-8c75-5d19eac19c0a',
    })
    id: string;

    @ApiProperty({
        description: 'The name of the client role',
        example: 'manage:shop',
    })
    name: string;
}

export class AssignPermissionsDto {
    @ApiProperty({
        type: [PermissionItemDto],
        description: 'A list of permissions to be assigned or removed',
    })
    permissions: PermissionItemDto[];
}