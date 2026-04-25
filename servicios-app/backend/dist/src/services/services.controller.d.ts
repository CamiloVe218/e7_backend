import { ServicesService } from './services.service';
export declare class ServicesController {
    private servicesService;
    constructor(servicesService: ServicesService);
    findAll(category?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        category: string;
        basePrice: number;
        imageUrl: string | null;
        isActive: boolean;
    }[]>;
    getCategories(): Promise<string[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        category: string;
        basePrice: number;
        imageUrl: string | null;
        isActive: boolean;
    }>;
    create(body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        category: string;
        basePrice: number;
        imageUrl: string | null;
        isActive: boolean;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        category: string;
        basePrice: number;
        imageUrl: string | null;
        isActive: boolean;
    }>;
}
