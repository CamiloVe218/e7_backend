import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from '../payments.controller';
import { PaymentsService } from '../payments.service';

const mockPaymentsService = {
  create: jest.fn(),
  simulate: jest.fn(),
  findByRequest: jest.fn(),
  findAll: jest.fn(),
};

describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockPaymentsService }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('create delegates to paymentsService.create', async () => {
    mockPaymentsService.create.mockResolvedValue({ id: 'pay-1' });

    const result = await controller.create({ serviceRequestId: 'req-1' });

    expect(mockPaymentsService.create).toHaveBeenCalledWith('req-1');
    expect(result).toEqual({ id: 'pay-1' });
  });

  it('simulate delegates to paymentsService.simulate', async () => {
    mockPaymentsService.simulate.mockResolvedValue({ status: 'COMPLETADO' });

    const result = await controller.simulate('req-1');

    expect(mockPaymentsService.simulate).toHaveBeenCalledWith('req-1');
    expect(result).toEqual({ status: 'COMPLETADO' });
  });

  it('findByRequest delegates to paymentsService.findByRequest', async () => {
    mockPaymentsService.findByRequest.mockResolvedValue({ id: 'pay-1' });

    const result = await controller.findByRequest('req-1');

    expect(mockPaymentsService.findByRequest).toHaveBeenCalledWith('req-1');
  });

  it('findAll delegates to paymentsService.findAll', async () => {
    mockPaymentsService.findAll.mockResolvedValue([]);

    const result = await controller.findAll();

    expect(mockPaymentsService.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });
});
