import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(serviceRequestId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        serviceRequestId: string;
        amount: number;
        method: string;
        transactionId: string | null;
    }>;
    simulate(serviceRequestId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        serviceRequestId: string;
        amount: number;
        method: string;
        transactionId: string | null;
    }>;
    findByRequest(serviceRequestId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        serviceRequestId: string;
        amount: number;
        method: string;
        transactionId: string | null;
    }>;
    findAll(): Promise<({
        serviceRequest: {
            service: {
                name: string;
            };
            client: {
                email: string;
                name: string;
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        serviceRequestId: string;
        amount: number;
        method: string;
        transactionId: string | null;
    })[]>;
}
