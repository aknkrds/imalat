import { IsNotEmpty, IsString, IsOptional, IsInt, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'Basic T-Shirt' })
  @IsString()
  @IsNotEmpty({ message: 'Ürün adı zorunludur.' })
  productName: string;

  @ApiPropertyOptional({ example: 'TS-001' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10000 })
  @IsInt({ message: 'Adet tam sayı olmalıdır.' })
  @Min(1, { message: 'Adet en az 1 olmalıdır.' })
  quantity: number;

  @ApiPropertyOptional({ example: 'adet' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 'Beyaz, Siyah, Lacivert' })
  @IsOptional()
  @IsString()
  colors?: string;

  @ApiPropertyOptional({ example: 'S, M, L, XL' })
  @IsOptional()
  @IsString()
  sizes?: string;

  @ApiPropertyOptional({ example: 'Penye' })
  @IsOptional()
  @IsString()
  fabricType?: string;

  @ApiPropertyOptional({ example: '%100 Pamuk' })
  @IsOptional()
  @IsString()
  fabricComposition?: string;

  @ApiPropertyOptional({ example: '2026-06-15' })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional({ example: 2, description: '1: Acil, 2: Normal, 3: Düşük' })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 3])
  priority?: number;

  @ApiProperty({ enum: ['DOMESTIC', 'EXPORT'], description: 'İç Piyasa veya İhracat' })
  @IsString()
  @IsIn(['DOMESTIC', 'EXPORT'], { message: 'Pazar tipi DOMESTIC veya EXPORT olmalıdır.' })
  marketType: string;

  @ApiPropertyOptional({ example: 10, description: 'KDV oranı: 0, 1, 10, 20' })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 10, 20])
  vatRate?: number;

  @ApiProperty({ enum: ['TRY', 'EUR', 'USD', 'GBP'], example: 'USD' })
  @IsString()
  @IsIn(['TRY', 'EUR', 'USD', 'GBP'], { message: 'Para birimi TRY, EUR, USD veya GBP olmalıdır.' })
  currency: string;

  @ApiPropertyOptional({ description: 'Müşteri ID' })
  @IsOptional()
  @IsString()
  contactId?: string;
}
