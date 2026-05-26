import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: JwtPayload) {
    const result = await this.usersService.create(dto, user.organizationId);
    return { success: true, data: result, message: 'Kullanıcı oluşturuldu.' };
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Kullanıcı listesi' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.usersService.findAll(user.organizationId, {
      page: page || 1,
      limit: limit || 20,
      search,
      sortBy,
      sortOrder,
    });
    return { success: true, ...result };
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Kullanıcı detay' })
  async findOne(@Param('id') id: string) {
    const result = await this.usersService.findOne(id);
    return { success: true, data: result };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Kullanıcı güncelle' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const result = await this.usersService.update(id, dto);
    return { success: true, data: result, message: 'Kullanıcı güncellendi.' };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Kullanıcı sil' })
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(id);
    return { success: true, ...result };
  }
}
