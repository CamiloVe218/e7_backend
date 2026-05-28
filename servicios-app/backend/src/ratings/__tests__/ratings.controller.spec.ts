import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from '../ratings.controller';
import { RatingsService } from '../ratings.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

const mockRatingsService = {
  create: jest.fn(),
  findByProvider: jest.fn(),
};

describe('RatingsController', () => {
  let controller: RatingsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [{ provide: RatingsService, useValue: mockRatingsService }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RatingsController>(RatingsController);
  });

  it('create delegates to ratingsService.create with user id', async () => {
    const dto = { serviceRequestId: 'req-1', score: 5 };
    mockRatingsService.create.mockResolvedValue({ id: 'rat-1' });

    const result = await controller.create({ id: 'client-1' } as any, dto as any);

    expect(mockRatingsService.create).toHaveBeenCalledWith('client-1', dto);
    expect(result).toEqual({ id: 'rat-1' });
  });

  it('findByProvider delegates to ratingsService.findByProvider', async () => {
    mockRatingsService.findByProvider.mockResolvedValue([{ id: 'rat-1' }]);

    const result = await controller.findByProvider('prov-1');

    expect(mockRatingsService.findByProvider).toHaveBeenCalledWith('prov-1');
    expect(result).toHaveLength(1);
  });
});
