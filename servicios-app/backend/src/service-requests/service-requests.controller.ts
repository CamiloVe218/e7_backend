import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ServiceRequestsService } from './service-requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../shared/types/user.types';

@ApiTags('service-requests')
@ApiBearerAuth()
@Controller('service-requests')
@UseGuards(JwtAuthGuard)
export class ServiceRequestsController {
  constructor(private serviceRequestsService: ServiceRequestsService) {}

  @ApiOperation({ summary: 'Crear una nueva solicitud de servicio (solo CLIENTE)' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('CLIENTE')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRequestDto) {
    return this.serviceRequestsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Listar solicitudes (filtradas por rol del usuario)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'limit', required: false, description: 'Máximo de resultados' })
  @ApiQuery({ name: 'page', required: false, description: 'Página (requiere limit)' })
  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.serviceRequestsService.findAll({
      status,
      role: user.role,
      userId: user.id,
      limit: limit ? parseInt(limit, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
    });
  }

  @ApiOperation({ summary: 'Historial de solicitudes finalizadas o canceladas' })
  @Get('history')
  getHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.serviceRequestsService.getHistory(user.id, user.role);
  }

  @ApiOperation({ summary: 'Estadísticas de solicitudes (solo ADMIN)' })
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getStats() {
    return this.serviceRequestsService.getStats();
  }

  @ApiOperation({ summary: 'Obtener una solicitud por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceRequestsService.findOne(id);
  }

  @ApiOperation({ summary: 'Aceptar una solicitud (solo PROVEEDOR)' })
  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles('PROVEEDOR')
  acceptRequest(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.serviceRequestsService.acceptRequest(id, user.id);
  }

  @ApiOperation({ summary: 'Cambiar el estado de una solicitud' })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.serviceRequestsService.updateStatus(id, user.id, dto);
  }
}
