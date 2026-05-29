import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ServiceRequestRepository } from '../service-requests/repositories/service-request.repository';

@Module({
  controllers: [AdminController],
  providers: [AdminService, ServiceRequestRepository],
})
export class AdminModule {}
