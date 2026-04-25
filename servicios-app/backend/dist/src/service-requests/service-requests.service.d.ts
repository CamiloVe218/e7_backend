import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class ServiceRequestsService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsGateway);
    create(clientId: string, dto: CreateRequestDto): Promise<{
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
    }>;
    findAll(filters: {
        status?: string;
        clientId?: string;
        providerId?: string;
        role?: string;
        userId?: string;
    }): Promise<({
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
    findOne(id: string): Promise<{
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
    }>;
    acceptRequest(requestId: string, userId: string): Promise<{
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
    }>;
    updateStatus(requestId: string, userId: string, dto: UpdateStatusDto): Promise<{
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
    }>;
    getHistory(userId: string, role: string): Promise<({
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
    getStats(): Promise<{
        total: number;
        pending: number;
        accepted: number;
        inProcess: number;
        completed: number;
        cancelled: number;
    }>;
}
