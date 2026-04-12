import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
    @ApiProperty({ example: 'my-frontend-app', description: 'The unique ID of the client' })
    clientId: string;

    @ApiProperty({ example: 'My Web Application', required: false })
    name?: string;

    @ApiProperty({ example: true, default: true })
    enabled?: boolean;

    @ApiProperty({ example: 'openid-connect', default: 'openid-connect' })
    protocol?: string;

    @ApiProperty({
        example: ['http://localhost:3000/*'],
        description: 'Valid redirect URIs after login',
        type: [String]
    })
    redirectUris?: string[];

    @ApiProperty({ example: false, description: 'If true, this client requires a secret' })
    publicClient?: boolean;
}