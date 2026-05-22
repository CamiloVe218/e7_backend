import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('ratings')
@ApiBearerAuth()
@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @ApiOperation({ summary: 'Calificar un servicio finalizado (solo CLIENTE)' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('CLIENTE')
  create(@CurrentUser() user: any, @Body() dto: CreateRatingDto) {
    return this.ratingsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Obtener calificaciones de un proveedor por su ID' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @Get('provider/:id')
  findByProvider(@Param('id') id: string) {
    return this.ratingsService.findByProvider(id);
  }
}
