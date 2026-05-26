import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'User ID zorunludur.' })
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Refresh token zorunludur.' })
  refreshToken: string;
}
