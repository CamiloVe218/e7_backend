import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ServiceRequestRepository } from './repositories/service-request.repository';
export declare class ServiceRequestsService {
    private readonly prisma;
    private readonly repository;
    private readonly notifications;
    constructor(prisma: PrismaService, repository: ServiceRequestRepository, notifications: NotificationsGateway);
    create(clientId: string, dto: CreateRequestDto): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
        service: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            basePrice: number;
            imageUrl: string | null;
            isActive: boolean;
        };
        provider: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            userId: string;
            bio: string | null;
            isAvailable: boolean;
            serviceType: string[];
        };
        payment: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            serviceRequestId: string;
            amount: number;
            method: string;
            transactionId: string | null;
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        address: string;
        lat: number;
        lng: number;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        serviceId: string;
        providerId: string | null;
    }>;
    findAll(filters: {
        status?: string;
        clientId?: string;
        providerId?: string;
        role?: string;
        userId?: string;
    }): Promise<({
        client: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
        service: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            basePrice: number;
            imageUrl: string | null;
            isActive: boolean;
        };
        provider: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            userId: string;
            bio: string | null;
            isAvailable: boolean;
            serviceType: string[];
        };
        payment: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            serviceRequestId: string;
            amount: number;
            method: string;
            transactionId: string | null;
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        address: string;
        lat: number;
        lng: number;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        serviceId: string;
        providerId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
        service: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            basePrice: number;
            imageUrl: string | null;
            isActive: boolean;
        };
        provider: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            userId: string;
            bio: string | null;
            isAvailable: boolean;
            serviceType: string[];
        };
        payment: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            serviceRequestId: string;
            amount: number;
            method: string;
            transactionId: string | null;
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        address: string;
        lat: number;
        lng: number;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        serviceId: string;
        providerId: string | null;
    }>;
    acceptRequest(requestId: string, userId: string): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
        service: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            basePrice: number;
            imageUrl: string | null;
            isActive: boolean;
        };
        provider: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            userId: string;
            bio: string | null;
            isAvailable: boolean;
            serviceType: string[];
        };
        payment: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            serviceRequestId: string;
            amount: number;
            method: string;
            transactionId: string | null;
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        address: string;
        lat: number;
        lng: number;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        serviceId: string;
        providerId: string | null;
    }>;
    updateStatus(requestId: string, userId: string, dto: UpdateStatusDto): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
        service: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            basePrice: number;
            imageUrl: string | null;
            isActive: boolean;
        };
        provider: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            userId: string;
            bio: string | null;
            isAvailable: boolean;
            serviceType: string[];
        };
        payment: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            serviceRequestId: string;
            amount: number;
            method: string;
            transactionId: string | null;
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        address: string;
        lat: number;
        lng: number;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        serviceId: string;
        providerId: string | null;
    }>;
    getHistory(userId: string, role: string): Promise<({
        client: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
        service: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: string;
            basePrice: number;
            imageUrl: string | null;
            isActive: boolean;
        };
        provider: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string;
            };
        } & {
            id: string;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
            updatedAt: Date;
            rating: number;
            userId: string;
            bio: string | null;
            isAvailable: boolean;
            serviceType: string[];
        };
        payment: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            serviceRequestId: string;
            amount: number;
            method: string;
            transactionId: string | null;
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        description: string;
        address: string;
        lat: number;
        lng: number;
        scheduledAt: Date | null;
        price: number | null;
        paymentMethod: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        serviceId: string;
        providerId: string | null;
    })[]>;
    getStats(): Promise<{
        total: number;
        pending: number;
        accepted: number;
        inProcess: number;
        completed: number;
        cancelled: number;
    }>;
}
