import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../shared/types/user.types';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findOne(user.id);
  }

  @ApiOperation({ summary: 'Actualizar nombre o teléfono del usuario autenticado' })
  @Patch('me')
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() body: { name?: string; phone?: string }) {
    return this.usersService.updateMe(user.id, body);
  }

  @ApiOperation({ summary: 'Listar todos los usuarios (solo ADMIN)' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Estadísticas de usuarios (solo ADMIN)' })
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getStats() {
    return this.usersService.getStats();
  }

  @ApiOperation({ summary: 'Obtener usuario por ID (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
