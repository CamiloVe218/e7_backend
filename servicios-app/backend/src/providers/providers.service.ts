import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async findAll(lat?: number, lng?: number, radius?: number) {
    const providers = await this.prisma.provider.findMany({
      where: { isAvailable: true },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        ratingsReceived: {
          select: { score: true },
        },
      },
      orderBy: { rating: 'desc' },
    });

    if (lat && lng && radius) {
      return providers.filter((p) => {
        if (!p.lat || !p.lng) return true;
        const distance = this.calculateDistance(lat, lng, p.lat, p.lng);
        return distance <= radius;
      });
    }

    return providers;
  }

  async findOne(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        ratingsReceived: {
          include: {
            client: { select: { name: true } },
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return provider;
  }

  async findByUserId(userId: string) {
    return this.prisma.provider.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  }

  async updateProfile(userId: string, data: any) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });

    if (!provider) {
      throw new NotFoundException('Perfil de proveedor no encontrado');
    }

    return this.prisma.provider.update({
      where: { userId },
      data: {
        bio: data.bio,
        serviceType: data.serviceType,
        lat: data.lat,
        lng: data.lng,
        isAvailable: data.isAvailable,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateAvailability(providerId: string, isAvailable: boolean) {
    return this.prisma.provider.update({
      where: { id: providerId },
      data: { isAvailable },
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}
