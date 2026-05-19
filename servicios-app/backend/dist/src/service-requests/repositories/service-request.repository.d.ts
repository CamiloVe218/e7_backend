import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare const REQUEST_INCLUDE: {
    service: true;
    client: {
        select: {
            id: true;
            name: true;
            email: true;
            phone: true;
        };
    };
    provider: {
        include: {
            user: {
                select: {
                    id: true;
                    name: true;
                    email: true;
                    phone: true;
                };
            };
        };
    };
    payment: true;
    rating: true;
};
export declare class ServiceRequestRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.ServiceRequestUncheckedCreateInput): Prisma.Prisma__ServiceRequestClient<{
        provider: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            bio: string | null;
            rating: number;
            isAvailable: boolean;
            lat: number | null;
            lng: number | null;
            serviceType: string[];
        };
        rating: {
            id: string;
            createdAt: Date;
            clientId: string;
            providerId: string;
            serviceRequestId: string;
            score: number;
            comment: string | null;
        };
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            category: string;
            basePrice: number;
            imageUrl: string | null;
            isActive: boolean;
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            serviceRequestId: string;
            amount: number;
            method: string;
            transactionId: string | null;
        };
        client: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number;
        lng: number;
        description: string;
        serviceId: string;
        address: string;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        clientId: string;
        providerId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findMany(args?: {
        where?: Prisma.ServiceRequestWhereInput;
        orderBy?: any;
    }): Prisma.PrismaPromise<({
        provider: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            bio: string | null;
            rating: number;
            isAvailable: boolean;
            lat: number | null;
            lng: number | null;
            serviceType: string[];
        };
        rating: {
            id: string;
            createdAt: Date;
            clientId: string;
            providerId: string;
            serviceRequestId: string;
            score: number;
            comment: string | null;
        };
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            category: string;
            basePrice: number;
            imageUrl: string | null;
            isActive: boolean;
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            serviceRequestId: string;
            amount: number;
            method: string;
            transactionId: string | null;
        };
        client: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number;
        lng: number;
        description: string;
        serviceId: string;
        address: string;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        clientId: string;
        providerId: string | null;
    })[]>;
    findOne(id: string): Prisma.Prisma__ServiceRequestClient<{
        provider: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            bio: string | null;
            rating: number;
            isAvailable: boolean;
            lat: number | null;
            lng: number | null;
            serviceType: string[];
        };
        rating: {
            id: string;
            createdAt: Date;
            clientId: string;
            providerId: string;
            serviceRequestId: string;
            score: number;
            comment: string | null;
        };
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            category: string;
            basePrice: number;
            imageUrl: string | null;
            isActive: boolean;
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            serviceRequestId: string;
            amount: number;
            method: string;
            transactionId: string | null;
        };
        client: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number;
        lng: number;
        description: string;
        serviceId: string;
        address: string;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        clientId: string;
        providerId: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findFirst(where: Prisma.ServiceRequestWhereInput): Prisma.Prisma__ServiceRequestClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number;
        lng: number;
        description: string;
        serviceId: string;
        address: string;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        clientId: string;
        providerId: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: Prisma.ServiceRequestUncheckedUpdateInput): Prisma.Prisma__ServiceRequestClient<{
        provider: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            bio: string | null;
            rating: number;
            isAvailable: boolean;
            lat: number | null;
            lng: number | null;
            serviceType: string[];
        };
        rating: {
            id: string;
            createdAt: Date;
            clientId: string;
            providerId: string;
            serviceRequestId: string;
            score: number;
            comment: string | null;
        };
        service: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            category: string;
            basePrice: number;
            imageUrl: string | null;
            isActive: boolean;
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            serviceRequestId: string;
            amount: number;
            method: string;
            transactionId: string | null;
        };
        client: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number;
        lng: number;
        description: string;
        serviceId: string;
        address: string;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        status: import(".prisma/client").$Enums.RequestStatus;
        clientId: string;
        providerId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    count(where?: Prisma.ServiceRequestWhereInput): Prisma.PrismaPromise<number>;
    transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
}
