import { Module } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestRepository } from './repositories/service-request.repository';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ServiceRequestsController],
  providers: [ServiceRequestsService, ServiceRequestRepository],
  exports: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
