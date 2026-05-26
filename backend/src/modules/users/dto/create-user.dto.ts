import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'ali@imalat.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @IsNotEmpty({ message: 'E-posta zorunludur.' })
  email: string;

  @ApiProperty({ example: 'Sifre123!' })
  @IsString()
  @IsNotEmpty({ message: 'Şifre zorunludur.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  password: string;

  @ApiProperty({ example: 'Ali' })
  @IsString()
  @IsNotEmpty({ message: 'Ad zorunludur.' })
  firstName: string;

  @ApiProperty({ example: 'Yılmaz' })
  @IsString()
  @IsNotEmpty({ message: 'Soyad zorunludur.' })
  lastName: string;

  @ApiPropertyOptional({ example: '05551234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: ['role_id_1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];
}
