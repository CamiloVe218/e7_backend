import { ProvidersService } from './providers.service';
export declare class ProvidersController {
    private providersService;
    constructor(providersService: ProvidersService);
    findAll(lat?: string, lng?: string, radius?: string): Promise<({
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
    getMyProfile(user: any): Promise<{
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
    updateProfile(user: any, body: any): Promise<{
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
}
