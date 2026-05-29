import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ServiceRequestRepository,
  REQUEST_INCLUDE,
} from '../service-requests/repositories/service-request.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ServiceRequestRepository,
  ) {}

  async suspendUser(adminId: string, targetId: string) {
    if (adminId === targetId) {
      throw new ForbiddenException('No puedes suspenderte a ti mismo');
    }

    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('Usuario no encontrado');
    if (target.role === 'ADMIN') {
      throw new ForbiddenException('No se puede suspender a un administrador');
    }

    return this.prisma.user.update({
      where: { id: targetId },
      data: { isSuspended: true },
      select: { id: true, name: true, email: true, role: true, isSuspended: true },
    });
  }

  async reactivateUser(targetId: string) {
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.user.update({
      where: { id: targetId },
      data: { isSuspended: false },
      select: { id: true, name: true, email: true, role: true, isSuspended: true },
    });
  }

  async cancelRequest(requestId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Solicitud no encontrada');

    if (request.status === 'FINALIZADA' || request.status === 'CANCELADA') {
      throw new ConflictException(
        `No se puede cancelar una solicitud en estado ${request.status}`,
      );
    }

    const updated = await this.repository.transaction(async (tx) => {
      const result = await tx.serviceRequest.update({
        where: { id: requestId },
        data: { status: 'CANCELADA' },
        include: REQUEST_INCLUDE,
      });

      if (request.providerId) {
        await tx.provider.update({
          where: { id: request.providerId },
          data: { isAvailable: true },
        });
      }

      return result;
    });

    return updated;
  }
}
