import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(clientId: string, dto: CreateRatingDto) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: dto.serviceRequestId },
      include: { rating: true },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.clientId !== clientId) {
      throw new ForbiddenException('Solo el cliente puede calificar este servicio');
    }

    if (request.status !== 'FINALIZADA') {
      throw new ConflictException('Solo se pueden calificar servicios finalizados');
    }

    if (request.rating) {
      throw new ConflictException('Este servicio ya fue calificado');
    }

    if (!request.providerId) {
      throw new ConflictException('El servicio no tiene proveedor asignado');
    }

    const rating = await this.prisma.rating.create({
      data: {
        serviceRequestId: dto.serviceRequestId,
        clientId,
        providerId: request.providerId,
        score: dto.score,
        comment: dto.comment,
      },
    });

    const allRatings = await this.prisma.rating.findMany({
      where: { providerId: request.providerId },
      select: { score: true },
    });
    const avgRating =
      allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;

    await this.prisma.provider.update({
      where: { id: request.providerId },
      data: { rating: Math.round(avgRating * 10) / 10 },
    });

    return rating;
  }

  async findByProvider(providerId: string) {
    return this.prisma.rating.findMany({
      where: { providerId },
      include: {
        client: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
