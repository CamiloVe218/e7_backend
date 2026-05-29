import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
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
    limit?: number;
    page?: number;
  }) {
    const where: Prisma.ServiceRequestWhereInput = {};

    if (filters.status) {
      where.status = filters.status as Prisma.EnumRequestStatusFilter;
    }

    if (filters.role === 'CLIENTE') {
      where.clientId = filters.userId;
    } else if (filters.role === 'PROVEEDOR') {
      const provider = await this.prisma.provider.findUnique({
        where: { userId: filters.userId },
      });
      if (provider) {
        if (filters.status && filters.status !== 'PENDIENTE') {
          where.providerId = provider.id;
        } else if (!filters.status) {
          where.OR = [
            { status: 'PENDIENTE' },
            { providerId: provider.id },
          ];
        }
      }
    }

    if (filters.limit && filters.page) {
      return this.repository.findManyPaginated(
        { where },
        filters.page,
        filters.limit,
      );
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

    const CLIENT_TRANSITIONS: Record<string, string[]> = {
      PENDIENTE:  ['CANCELADA'],
      ACEPTADA:   ['CANCELADA'],
      EN_PROCESO: ['CANCELADA'],
    };
    const PROVIDER_TRANSITIONS: Record<string, string[]> = {
      ACEPTADA:   ['EN_PROCESO'],
      EN_PROCESO: ['FINALIZADA'],
    };

    const allowedTransitions = isClient ? CLIENT_TRANSITIONS : PROVIDER_TRANSITIONS;
    const allowed = allowedTransitions[request.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new ForbiddenException(
        `Transición no permitida: ${request.status} → ${dto.status}`,
      );
    }

    const isTerminal = dto.status === 'FINALIZADA' || dto.status === 'CANCELADA';

    // Wrap both the status update and the provider availability reset in a
    // single transaction so they either both succeed or both fail.
    const updated = await this.repository.transaction(async (tx) => {
      const result = await tx.serviceRequest.update({
        where: { id: requestId },
        data: { status: dto.status as unknown as RequestStatus },
        include: REQUEST_INCLUDE,
      });

      if (isTerminal && request.providerId) {
        await tx.provider.update({
          where: { id: request.providerId },
          data: { isAvailable: true },
        });
      }

      return result;
    });

    // Payload is the same `updated` object for all events — consistent structure.
    this.notifications.notifyUser(request.clientId, 'request:status_changed', updated);
    if (request.provider) {
      this.notifications.notifyUser(
        request.provider.user.id,
        'request:status_changed',
        updated,
      );
    }
    this.notifications.notifyAll('request:updated', updated);

    // Emit request:completed only on the exact EN_PROCESO → FINALIZADA transition.
    // Guard on previousStatus prevents duplicate emissions if the same status is
    // somehow sent twice (idempotency).
    if (request.status !== 'FINALIZADA' && dto.status === 'FINALIZADA') {
      this.notifications.notifyUser(request.clientId, 'request:completed', updated);
    }

    return updated;
  }

  async getHistory(userId: string, role: string) {
    const where: Prisma.ServiceRequestWhereInput = {
      status: { in: ['FINALIZADA', 'CANCELADA'] },
    };

    if (role === 'CLIENTE') {
      where.clientId = userId;
    } else if (role === 'PROVEEDOR') {
      const provider = await this.prisma.provider.findUnique({
        where: { userId },
      });
      if (provider) {
        where.providerId = provider.id;
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
