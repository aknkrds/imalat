import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('contacts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUSTOMER_REP', 'ACCOUNTING')
  @ApiOperation({ summary: 'Yeni müşteri/tedarikçi oluştur' })
  async create(@Body() dto: CreateContactDto, @CurrentUser() user: JwtPayload) {
    const result = await this.contactsService.create(dto, user.organizationId);
    return { success: true, data: result, message: 'Kayıt oluşturuldu.' };
  }

  @Get()
  @ApiOperation({ summary: 'Müşteri/tedarikçi listesi' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.contactsService.findAll(user.organizationId, {
      page: page || 1, limit: limit || 20, search, type, sortBy, sortOrder,
    } as any);
    return { success: true, ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Müşteri/tedarikçi detay' })
  async findOne(@Param('id') id: string) {
    const result = await this.contactsService.findOne(id);
    return { success: true, data: result };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUSTOMER_REP', 'ACCOUNTING')
  @ApiOperation({ summary: 'Müşteri/tedarikçi güncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    const result = await this.contactsService.update(id, dto);
    return { success: true, data: result, message: 'Kayıt güncellendi.' };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Müşteri/tedarikçi sil' })
  async remove(@Param('id') id: string) {
    const result = await this.contactsService.remove(id);
    return { success: true, ...result };
  }
}
