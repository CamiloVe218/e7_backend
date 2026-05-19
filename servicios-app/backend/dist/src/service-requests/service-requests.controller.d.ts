import { ServiceRequestsService } from './service-requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
export declare class ServiceRequestsController {
    private serviceRequestsService;
    constructor(serviceRequestsService: ServiceRequestsService);
    create(user: any, dto: CreateRequestDto): Promise<{
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
    findAll(user: any, status?: string): Promise<({
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
    getHistory(user: any): Promise<({
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
    acceptRequest(id: string, user: any): Promise<{
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
    updateStatus(id: string, user: any, dto: UpdateStatusDto): Promise<{
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
}
