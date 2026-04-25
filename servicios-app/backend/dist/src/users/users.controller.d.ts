import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(user: any): Promise<{
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
    updateMe(user: any, body: {
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
    getStats(): Promise<{
        totalUsers: number;
        totalClients: number;
        totalProviders: number;
        totalAdmins: number;
    }>;
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
}
