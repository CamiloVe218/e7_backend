import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    return service;
  }

  async create(data: CreateServiceDto) {
    return this.prisma.service.create({ data });
  }

  async update(id: string, data: UpdateServiceDto) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async getCategories() {
    const services = await this.prisma.service.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return services.map((s) => s.category);
  }
}
