import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import {
  ServiceRequestRepository,
  REQUEST_INCLUDE,
} from './repositories/service-request.repository';

@Injectable()
export class ServiceRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ServiceRequestRepository,
    private readonly notifications: NotificationsGateway,
  ) {}

  async create(clientId: string, dto: CreateRequestDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    const request = await this.repository.create({
      clientId,
      serviceId: dto.serviceId,
      description: dto.description,
      address: dto.address,
      lat: dto.lat,
      lng: dto.lng,
      price: dto.price || service.basePrice,
      paymentMethod: dto.paymentMethod || 'EFECTIVO',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });

    this.notifications.notifyAll('request:new', request);
    return request;
  }

  async findAll(filters: {
    status?: string;
    clientId?: string;
    providerId?: string;
    role?: string;
    userId?: string;
  }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.role === 'CLIENTE') {
      where.clientId = filters.userId;
    } else if (filters.role === 'PROVEEDOR') {
      const provider = await this.prisma.provider.findUnique({
        where: { userId: filters.userId },
      });
      if (provider) {
        if (filters.status) {
          where.status = filters.status;
        } else {
          where.OR = [
            { status: 'PENDIENTE' },
            { providerId: provider.id },
          ];
        }
        if (filters.status && filters.status !== 'PENDIENTE') {
          where.providerId = provider.id;
          delete where.OR;
        }
      }
    }

    return this.repository.findMany({ where });
  }

  async findOne(id: string) {
    const request = await this.repository.findOne(id);

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return request;
  }

  async acceptRequest(requestId: string, userId: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });

    if (!provider) {
      throw new ForbiddenException('Solo proveedores pueden aceptar solicitudes');
    }

    return this.repository.transaction(async (tx) => {
      const activeRequest = await tx.serviceRequest.findFirst({
        where: {
          providerId: provider.id,
          status: { in: ['ACEPTADA', 'EN_PROCESO'] },
        },
      });

      if (activeRequest) {
        throw new ConflictException(
          'Ya tienes una solicitud activa. Finalízala antes de aceptar otra.',
        );
      }

      const request = await tx.serviceRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      if (request.status !== 'PENDIENTE') {
        throw new ConflictException('Esta solicitud ya no está disponible');
      }

      const updated = await tx.serviceRequest.update({
        where: { id: requestId },
        data: {
          providerId: provider.id,
          status: 'ACEPTADA',
        },
        include: REQUEST_INCLUDE,
      });

      await tx.provider.update({
        where: { id: provider.id },
        data: { isAvailable: false },
      });

      this.notifications.notifyUser(request.clientId, 'request:accepted', updated);
      this.notifications.notifyAll('request:updated', updated);

      return updated;
    });
  }

  async updateStatus(requestId: string, userId: string, dto: UpdateStatusDto) {
    const request = await this.repository.findOne(requestId);

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });

    const isClient = request.clientId === userId;
    const isProvider = provider && request.providerId === provider.id;

    if (!isClient && !isProvider) {
      throw new ForbiddenException('No tienes permisos para modificar esta solicitud');
    }
/**state */
    const validTransitions: Record<string, string[]> = {
      ACEPTADA: ['EN_PROCESO', 'CANCELADA'],
      EN_PROCESO: ['FINALIZADA', 'CANCELADA'],
      PENDIENTE: ['CANCELADA'],
    };

    const allowed = validTransitions[request.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new ConflictException(
        `No se puede cambiar de ${request.status} a ${dto.status}`,
      );
    }

    const updated = await this.repository.update(requestId, { status: dto.status as any });

    if (dto.status === 'FINALIZADA' || dto.status === 'CANCELADA') {
      if (request.providerId) {
        await this.prisma.provider.update({
          where: { id: request.providerId },
          data: { isAvailable: true },
        });
      }
    }

    this.notifications.notifyUser(request.clientId, 'request:status_changed', updated);
    if (request.provider) {
      this.notifications.notifyUser(request.provider.user.id, 'request:status_changed', updated);
    }
    this.notifications.notifyAll('request:updated', updated);

    return updated;
  }

  async getHistory(userId: string, role: string) {
    const where: any = {};

    if (role === 'CLIENTE') {
      where.clientId = userId;
      where.status = { in: ['FINALIZADA', 'CANCELADA'] };
    } else if (role === 'PROVEEDOR') {
      const provider = await this.prisma.provider.findUnique({
        where: { userId },
      });
      if (provider) {
        where.providerId = provider.id;
        where.status = { in: ['FINALIZADA', 'CANCELADA'] };
      }
    }

    return this.repository.findMany({ where, orderBy: { updatedAt: 'desc' } });
  }

  async getStats() {
    const [total, pending, accepted, inProcess, completed, cancelled] = await Promise.all([
      this.repository.count(),
      this.repository.count({ status: 'PENDIENTE' }),
      this.repository.count({ status: 'ACEPTADA' }),
      this.repository.count({ status: 'EN_PROCESO' }),
      this.repository.count({ status: 'FINALIZADA' }),
      this.repository.count({ status: 'CANCELADA' }),
    ]);

    return { total, pending, accepted, inProcess, completed, cancelled };
  }
}
