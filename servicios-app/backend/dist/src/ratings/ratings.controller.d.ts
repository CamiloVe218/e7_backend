import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
export declare class RatingsController {
    private ratingsService;
    constructor(ratingsService: RatingsService);
    create(user: any, dto: CreateRatingDto): Promise<{
        id: string;
        createdAt: Date;
        clientId: string;
        providerId: string;
        serviceRequestId: string;
        score: number;
        comment: string | null;
    }>;
    findByProvider(id: string): Promise<({
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
