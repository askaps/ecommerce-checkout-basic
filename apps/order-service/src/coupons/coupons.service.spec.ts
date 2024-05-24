import { ConfigService } from '@nestjs/config';
import { TestingModule, Test } from '@nestjs/testing';
import { CouponsRepository } from './coupons.repository';
import { CouponsService } from './coupons.service';

describe('CouponsService', () => {
  let service: CouponsService;
  let repository: CouponsRepository;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        {
          provide: CouponsRepository,
          useValue: {
            create: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    repository = module.get<CouponsRepository>(CouponsRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('create', () => {
    it('should create a coupon', async () => {
      const createSpy = jest.spyOn(repository, 'create');

      const ctx = 'test';
      const code = 'test_code';

      const expectedCoupon = 'test_coupon_id';

      createSpy.mockResolvedValue(expectedCoupon);

      const result = await service.create(ctx, { code });

      expect(createSpy).toHaveBeenCalledWith(ctx, { code });
      expect(result).toEqual({ code: expectedCoupon });
    });
  });

  describe('get', () => {
    it('should return the coupon ID if found', async () => {
      const ctx = 'test';
      const code = 'test_code';
      const expectedCouponId = 'test_coupon_id';

      jest.spyOn(repository, 'get').mockResolvedValue(expectedCouponId);

      const result = await service.get(ctx, code);

      expect(repository.get).toHaveBeenCalledWith(ctx, code);
      expect(result).toEqual(expectedCouponId);
    });

    it('should return null if coupon is not found', async () => {
      const ctx = 'test';
      const code = 'test_code';

      jest.spyOn(repository, 'get').mockResolvedValue(null);

      const result = await service.get(ctx, code);

      expect(repository.get).toHaveBeenCalledWith(ctx, code);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a coupon code and return true', async () => {
      const ctx = 'test';
      const code = 'testCode';

      repository.delete = jest.fn().mockResolvedValue(true);

      const result = await service.delete(ctx, code);

      expect(repository.delete).toHaveBeenCalledWith(ctx, code);
      expect(result).toBe(true);
    });

    it('should throw an error if deletion fails', async () => {
      const ctx = 'test';
      const code = 'testCode';
      const error = new Error('Deletion failed');

      repository.delete = jest.fn().mockRejectedValue(error);

      await expect(service.delete(ctx, code)).rejects.toThrowError(error);
      expect(repository.delete).toHaveBeenCalledWith(ctx, code);
    });
  });
});
