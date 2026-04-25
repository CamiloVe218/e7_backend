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
import { ServiceRequestsService } from './service-requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('service-requests')
@UseGuards(JwtAuthGuard)
export class ServiceRequestsController {
  constructor(private serviceRequestsService: ServiceRequestsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('CLIENTE')
  create(@CurrentUser() user: any, @Body() dto: CreateRequestDto) {
    return this.serviceRequestsService.create(user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.serviceRequestsService.findAll({
      status,
      role: user.role,
      userId: user.id,
    });
  }

  @Get('history')
  getHistory(@CurrentUser() user: any) {
    return this.serviceRequestsService.getHistory(user.id, user.role);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getStats() {
    return this.serviceRequestsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceRequestsService.findOne(id);
  }

  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles('PROVEEDOR')
  acceptRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.serviceRequestsService.acceptRequest(id, user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.serviceRequestsService.updateStatus(id, user.id, dto);
  }
}
