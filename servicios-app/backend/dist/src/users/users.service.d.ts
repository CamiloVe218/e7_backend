import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string;
        createdAt: Date;
        provider: {
            id: string;
            bio: string;
            rating: number;
            isAvailable: boolean;
            serviceType: string[];
        };
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string;
        createdAt: Date;
        provider: {
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
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string;
        createdAt: Date;
    }>;
    updateMe(id: string, data: {
        name?: string;
        phone?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string;
        createdAt: Date;
        provider: {
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
    }>;
    getStats(): Promise<{
        totalUsers: number;
        totalClients: number;
        totalProviders: number;
        totalAdmins: number;
    }>;
}
