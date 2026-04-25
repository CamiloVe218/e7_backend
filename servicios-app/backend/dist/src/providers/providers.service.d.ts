import { PrismaService } from '../prisma/prisma.service';
export declare class ProvidersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(lat?: number, lng?: number, radius?: number): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
        ratingsReceived: {
            score: number;
        }[];
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
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
        ratingsReceived: ({
            client: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            clientId: string;
            providerId: string;
            serviceRequestId: string;
            score: number;
            comment: string | null;
        })[];
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
    }>;
    findByUserId(userId: string): Promise<{
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
    }>;
    updateProfile(userId: string, data: any): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
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
    }>;
    updateAvailability(providerId: string, isAvailable: boolean): Promise<{
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
    }>;
    private calculateDistance;
    private toRad;
}
