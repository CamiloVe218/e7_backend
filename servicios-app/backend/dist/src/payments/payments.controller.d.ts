import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    create(body: {
        serviceRequestId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        serviceRequestId: string;
        amount: number;
        method: string;
        transactionId: string | null;
    }>;
    simulate(requestId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        serviceRequestId: string;
        amount: number;
        method: string;
        transactionId: string | null;
    }>;
    findByRequest(requestId: string): Promise<{
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
