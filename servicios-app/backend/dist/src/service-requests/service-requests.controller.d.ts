import { ServiceRequestsService } from './service-requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
export declare class ServiceRequestsController {
    private serviceRequestsService;
    constructor(serviceRequestsService: ServiceRequestsService);
    create(user: any, dto: CreateRequestDto): Promise<{
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
    findAll(user: any, status?: string): Promise<({
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
    getHistory(user: any): Promise<({
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
    acceptRequest(id: string, user: any): Promise<{
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
    updateStatus(id: string, user: any, dto: UpdateStatusDto): Promise<{
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
}
