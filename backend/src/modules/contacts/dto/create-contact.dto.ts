import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ enum: ['CUSTOMER', 'SUPPLIER'], description: 'Müşteri (M) veya Tedarikçi (T)' })
  @IsString()
  @IsIn(['CUSTOMER', 'SUPPLIER'], { message: 'Tip CUSTOMER veya SUPPLIER olmalıdır.' })
  type: string;

  @ApiProperty({ example: 'ABC Tekstil' })
  @IsString()
  @IsNotEmpty({ message: 'İsim zorunludur.' })
  name: string;

  @ApiPropertyOptional({ example: 'Ahmet Bey' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'info@abctekstil.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '05551234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiPropertyOptional({ example: 'İstanbul VD' })
  @IsOptional()
  @IsString()
  taxOffice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
