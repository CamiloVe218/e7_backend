import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('services')
@ApiBearerAuth()
@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @ApiOperation({ summary: 'Listar servicios activos del catálogo (filtro por categoría opcional)' })
  @ApiQuery({ name: 'category', required: false, description: 'Categoría del servicio (HOGAR, TECNOLOGIA, etc.)' })
  @Get()
  findAll(@Query('category') category?: string) {
    return this.servicesService.findAll(category);
  }

  @ApiOperation({ summary: 'Obtener categorías disponibles en el catálogo' })
  @Get('categories')
  getCategories() {
    return this.servicesService.getCategories();
  }

  @ApiOperation({ summary: 'Obtener servicio por ID' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @ApiOperation({ summary: 'Crear nuevo servicio en el catálogo (solo ADMIN)' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() body: any) {
    return this.servicesService.create(body);
  }

  @ApiOperation({ summary: 'Actualizar servicio del catálogo (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return this.servicesService.update(id, body);
  }
}
