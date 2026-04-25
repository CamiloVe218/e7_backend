import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  create(@Body() body: { serviceRequestId: string }) {
    return this.paymentsService.create(body.serviceRequestId);
  }

  @Post(':requestId/simulate')
  simulate(@Param('requestId') requestId: string) {
    return this.paymentsService.simulate(requestId);
  }

  @Get(':requestId')
  findByRequest(@Param('requestId') requestId: string) {
    return this.paymentsService.findByRequest(requestId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.paymentsService.findAll();
  }
}
