import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../shared/types/user.types';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';

@ApiTags('providers')
@ApiBearerAuth()
@Controller('providers')
@UseGuards(JwtAuthGuard)
export class ProvidersController {
  constructor(private providersService: ProvidersService) {}

  @ApiOperation({ summary: 'Listar proveedores disponibles (con filtro geográfico opcional)' })
  @ApiQuery({ name: 'lat', required: false, description: 'Latitud del punto de búsqueda' })
  @ApiQuery({ name: 'lng', required: false, description: 'Longitud del punto de búsqueda' })
  @ApiQuery({ name: 'radius', required: false, description: 'Radio en km (default 10)' })
  @Get()
  findAll(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    return this.providersService.findAll(
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
      radius ? parseFloat(radius) : undefined,
    );
  }

  @ApiOperation({ summary: 'Obtener perfil del proveedor autenticado' })
  @Get('profile')
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.providersService.findByUserId(user.id);
  }

  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar perfil del proveedor autenticado' })
  @Patch('profile')
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateProviderProfileDto) {
    return this.providersService.updateProfile(user.id, body);
  }
}
