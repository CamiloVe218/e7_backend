import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(serviceRequestId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: { service: true, payment: true },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.payment) {
      throw new ConflictException('Ya existe un pago para esta solicitud');
    }

    return this.prisma.payment.create({
      data: {
        serviceRequestId,
        amount: request.price || request.service.basePrice,
        status: 'PENDIENTE',
        method: 'SIMULADO',
      },
    });
  }

  async simulate(serviceRequestId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { serviceRequestId },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    const success = Math.random() > 0.1;

    return this.prisma.payment.update({
      where: { serviceRequestId },
      data: {
        status: success ? 'COMPLETADO' : 'FALLIDO',
        transactionId: success ? `TXN-${uuidv4().substring(0, 8).toUpperCase()}` : null,
      },
    });
  }

  async findByRequest(serviceRequestId: string) {
    return this.prisma.payment.findUnique({
      where: { serviceRequestId },
    });
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: {
        serviceRequest: {
          include: {
            client: { select: { name: true, email: true } },
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
