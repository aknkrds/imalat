import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUSTOMER_REP')
  @ApiOperation({ summary: 'Yeni sipariş oluştur' })
  async create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    const result = await this.ordersService.create(dto, user);
    return { success: true, data: result, message: 'Sipariş oluşturuldu.' };
  }

  @Get()
  @ApiOperation({ summary: 'Sipariş listesi' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('stateCode') stateCode?: string,
    @Query('contactId') contactId?: string,
    @Query('marketType') marketType?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.ordersService.findAll(user, {
      page: page || 1, limit: limit || 20, search, stateCode, contactId, marketType, sortBy, sortOrder,
    } as any);
    return { success: true, ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Sipariş detay' })
  async findOne(@Param('id') id: string) {
    const result = await this.ordersService.findOne(id);
    return { success: true, data: result };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATION', 'CUSTOMER_REP')
  @ApiOperation({ summary: 'Sipariş güncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto, @CurrentUser() user: JwtPayload) {
    const result = await this.ordersService.update(id, dto, user);
    return { success: true, data: result, message: 'Sipariş güncellendi.' };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Sipariş sil' })
  async remove(@Param('id') id: string) {
    const result = await this.ordersService.remove(id);
    return { success: true, ...result };
  }
}
