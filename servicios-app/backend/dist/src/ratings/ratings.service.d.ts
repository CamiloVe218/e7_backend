import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
export declare class RatingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(clientId: string, dto: CreateRatingDto): Promise<{
        id: string;
        createdAt: Date;
        clientId: string;
        providerId: string;
        serviceRequestId: string;
        score: number;
        comment: string | null;
    }>;
    findByProvider(providerId: string): Promise<({
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
    })[]>;
}
