import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const REQUEST_INCLUDE = {
  service: true,
  client: { select: { id: true, name: true, email: true, phone: true } },
  provider: {
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  },
  payment: true,
  rating: true,
} satisfies Prisma.ServiceRequestInclude;
@Injectable()
export class ServiceRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ServiceRequestUncheckedCreateInput) {
    return this.prisma.serviceRequest.create({ data, include: REQUEST_INCLUDE });
  }

  async findMany(args: {
    where?: Prisma.ServiceRequestWhereInput;
    orderBy?: Prisma.ServiceRequestOrderByWithRelationInput | Prisma.ServiceRequestOrderByWithRelationInput[];
    take?: number;
    skip?: number;
  } = {}) {
    return this.prisma.serviceRequest.findMany({
      where: args.where,
      include: REQUEST_INCLUDE,
      orderBy: args.orderBy ?? { createdAt: 'desc' },
      take: args.take,
      skip: args.skip,
    });
  }

  async findManyPaginated(
    args: {
      where?: Prisma.ServiceRequestWhereInput;
      orderBy?: Prisma.ServiceRequestOrderByWithRelationInput | Prisma.ServiceRequestOrderByWithRelationInput[];
    },
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where: args.where,
        include: REQUEST_INCLUDE,
        orderBy: args.orderBy ?? { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.serviceRequest.count({ where: args.where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      hasMore: skip + data.length < total,
    };
  }

  findOne(id: string) {
    return this.prisma.serviceRequest.findUnique({
      where: { id },
      include: REQUEST_INCLUDE,
    });
  }

  findFirst(where: Prisma.ServiceRequestWhereInput) {
    return this.prisma.serviceRequest.findFirst({ where });
  }

  update(id: string, data: Prisma.ServiceRequestUncheckedUpdateInput) {
    return this.prisma.serviceRequest.update({
      where: { id },
      data,
      include: REQUEST_INCLUDE,
    });
  }

  count(where?: Prisma.ServiceRequestWhereInput) {
    return this.prisma.serviceRequest.count({ where });
  }

  transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
