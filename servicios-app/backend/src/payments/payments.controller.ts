import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Crear registro de pago para una solicitud finalizada' })
  @Post()
  create(@Body() body: { serviceRequestId: string }) {
    return this.paymentsService.create(body.serviceRequestId);
  }

  @ApiOperation({ summary: 'Simular procesamiento de pago (entorno de pruebas)' })
  @ApiParam({ name: 'requestId', description: 'ID de la solicitud de servicio' })
  @Post(':requestId/simulate')
  simulate(@Param('requestId') requestId: string) {
    return this.paymentsService.simulate(requestId);
  }

  @ApiOperation({ summary: 'Obtener el pago asociado a una solicitud' })
  @ApiParam({ name: 'requestId', description: 'ID de la solicitud de servicio' })
  @Get(':requestId')
  findByRequest(@Param('requestId') requestId: string) {
    return this.paymentsService.findByRequest(requestId);
  }

  @ApiOperation({ summary: 'Listar todos los pagos (solo ADMIN)' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.paymentsService.findAll();
  }
}
