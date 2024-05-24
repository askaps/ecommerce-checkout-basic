import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { CheckoutsService } from '../checkouts/checkouts.service';
import { CouponsService } from '../coupons/coupons.service';

describe('AdminService', () => {
  let service: AdminService;
  let checkoutsService: CheckoutsService;
  let couponsService: CouponsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: CheckoutsService,
          useValue: {
            gelAll: jest.fn(),
          },
        },
        {
          provide: CouponsService,
          useValue: {
            gelAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    checkoutsService = module.get<CheckoutsService>(CheckoutsService);
    couponsService = module.get<CouponsService>(CouponsService);
  });

  describe('getOverview', () => {
    it('should return an overview of orders, products, and coupons', async () => {
      const orders = [
        {
          id: 'id',
          userId: 'userId',
          couponCode: 'couponCode',
          subTotal: 100,
          discount: 10,
          total: 90,
          products: [
            {
              id: '1',
              name: 'Product Name - 1',
              quantity: 1,
              price: 100,
              subTotal: 100,
              discount: 10,
            },
          ],
        },
      ];

      const coupons = ['couponCode'];

      checkoutsService.getAll = jest.fn().mockResolvedValue(orders);
      couponsService.getAll = jest.fn().mockResolvedValue(coupons);

      const result = await service.overview('test');

      expect(result).toEqual({
        orders: {
          totalAmount: 90,
          totalDiscountAmount: 10,
          count: 1,
          data: orders,
        },
        products: {
          count: 1,
          data: orders[0].products,
        },
        coupons: {
          count: 1,
          data: coupons,
        },
      });
      expect(checkoutsService.getAll).toHaveBeenCalledWith('test');
      expect(couponsService.getAll).toHaveBeenCalledWith('test');
    });
  });
});
