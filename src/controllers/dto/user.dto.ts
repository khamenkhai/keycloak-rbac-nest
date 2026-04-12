import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEmail, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
    @ApiProperty({ example: 'johndoe', description: 'The unique username for the user' })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ example: 'john@example.com', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: 'John', required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ example: 'Doe', required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ default: true, required: false })
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}



export class UserRoleMappingDto {
    @ApiProperty({
        example: '8bc23a...',
        description: 'The internal UUID of the ROLE'
    })
    @IsNotEmpty()
    @IsString()
    roleId: string;

    @ApiProperty({
        example: 'admin',
        description: 'The human-readable name of the role'
    })
    @IsNotEmpty()
    @IsString()
    roleName: string;
}

export class AssignClientRolesDto {
    @ApiProperty({
        example: 'user-uuid-123',
        description: 'The internal UUID of the user'
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        example: 'client-uuid-456',
        description: 'The internal UUID of the client (not the client-id)'
    })
    @IsNotEmpty()
    @IsString()
    clientUuid: string;

    @ApiProperty({
        type: [UserRoleMappingDto],
        description: 'List of roles to assign'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserRoleMappingDto)
    roles: UserRoleMappingDto[];
}