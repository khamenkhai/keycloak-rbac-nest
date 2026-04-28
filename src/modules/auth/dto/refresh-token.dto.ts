import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzUxMi...',
    description: 'The refresh token received from the login endpoint',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
