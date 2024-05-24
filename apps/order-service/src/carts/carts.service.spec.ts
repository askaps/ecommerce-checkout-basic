import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { CartsRepository } from './carts.repository';
import { v4 as uuidv4 } from 'uuid';
import { UnauthorizedException } from '@nestjs/common';
import { TCart } from './entities/cart.entity';
import { ConfigService } from '@nestjs/config';
import { CheckedException } from '@app/shared';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CouponsService } from '../coupons/coupons.service';

describe('CartsService', () => {
  let service: CartsService;
  let repository: CartsRepository;
  let configService: ConfigService;
  let couponsService: CouponsService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn().mockResolvedValue('1'),
            set: jest.fn(),
          },
        },
        CartsService,
        {
          provide: CartsRepository,
          useValue: {
            get: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: CouponsService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    repository = module.get<CartsRepository>(CartsRepository);
    configService = module.get<ConfigService>(ConfigService);
    couponsService = module.get<CouponsService>(CouponsService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cart', async () => {
      const userId = uuidv4();
      const ctx = 'test';
      const cartId = `cart_${uuidv4()}`;
      const expectedCart: Partial<TCart> = {
        id: cartId,
        userId,
        subTotal: 0,
        discount: 0,
        total: 0,
      };

      repository.create = jest.fn().mockResolvedValue(expectedCart);

      const result = await service.create(ctx, userId);

      expect(result).toEqual(expectedCart);
    });
  });

  describe('get', () => {
    it('should throw an exception if the cart is not found', async () => {
      repository.get = jest.fn().mockResolvedValue(null);

      await expect(service.patch('context', 'userId', 'cartId', { couponCode: 'code' })).rejects.toThrow(
        CheckedException,
      );
    });

    it('should get a cart by id', async () => {
      const userId = uuidv4();
      const ctx = 'test';
      const id = uuidv4();
      const cart = { id, userId };

      repository.get = jest.fn().mockResolvedValue(cart);

      const result = await service.get(ctx, userId, id);

      expect(result).toEqual(cart);
      expect(repository.get).toHaveBeenCalledWith(ctx, id);
    });

    it('should throw an UnauthorizedException if the userId does not match', async () => {
      const userId = uuidv4();
      const ctx = 'test';
      const id = uuidv4();
      const cart = { id, userId: 'userId' };

      repository.get = jest.fn().mockResolvedValue(cart);

      await expect(service.get(ctx, userId, id)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should throw an exception if the cart is not found', async () => {
      repository.get = jest.fn().mockResolvedValue(null);

      await expect(service.patch('context', 'userId', 'cartId', { couponCode: 'code' })).rejects.toThrow(
        CheckedException,
      );
    });

    it('should update a cart by id', async () => {
      const userId = uuidv4();
      const ctx = 'test';
      const id = uuidv4();
      const cart = { id, userId, subTotal: 100, discount: 0, total: 100 };

      const productId = uuidv4();
      const request = {
        products: [
          { id: productId, quantity: 1, name: `Product Name - ${productId}`, price: 100, discount: 0, subTotal: 100 },
        ],
      };
      const expectedCart = { ...cart, ...request };

      repository.get = jest.fn().mockResolvedValue(cart);
      repository.update = jest.fn().mockResolvedValue(expectedCart);

      const result = await service.update(ctx, userId, id, request);

      expect(result).toEqual(expectedCart);
      expect(repository.get).toHaveBeenCalledWith(ctx, id);
      expect(repository.update).toHaveBeenCalledWith(ctx, id, expectedCart);
    });

    it('should throw an UnauthorizedException if the userId does not match', async () => {
      const userId = uuidv4();
      const ctx = 'test';
      const id = uuidv4();
      const cart = { id, userId: 'differentUserId' };
      const request = { products: [{ id: uuidv4(), quantity: 1 }] };

      repository.get = jest.fn().mockResolvedValue(cart);

      await expect(service.update(ctx, userId, id, request)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('patch', () => {
    it('should throw an exception if the cart is not found', async () => {
      repository.get = jest.fn().mockResolvedValue(null);

      await expect(service.patch('context', 'userId', 'cartId', { couponCode: 'code' })).rejects.toThrow(
        CheckedException,
      );
    });

    it('should throw an exception if the userId does not match the cart userId', async () => {
      repository.get = jest.fn().mockResolvedValue({ userId: 'otherUserId' });

      await expect(service.patch('context', 'userId', 'cartId', { couponCode: 'code' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should calculate totals and update the cart if a coupon code is provided', async () => {
      const productId = uuidv4();
      const cart = {
        userId: 'userId',
        products: [
          { id: productId, quantity: 2, name: `Product Name - ${productId}`, price: 10, discount: 2, subTotal: 20 },
        ],
      };

      const expectedCart = { ...cart, discount: 2, subTotal: 20, total: 18, couponCode: null };

      repository.get = jest.fn().mockResolvedValue(cart);
      repository.update = jest.fn().mockResolvedValue(expectedCart);

      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce('5');

      const result = await service.patch('context', 'userId', 'cartId', { couponCode: 'code' });

      expect(result).toEqual(expectedCart);
      expect(repository.update).toHaveBeenCalledWith('context', 'cartId', expectedCart);
    });

    it('should return the cart if no coupon code is provided', async () => {
      const cart = { userId: 'userId', products: [{ price: 10, quantity: 2 }] };
      repository.get = jest.fn().mockResolvedValue(cart);

      const result = await service.patch('context', 'userId', 'cartId', {});

      expect(result).toEqual(cart);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('calculateTotals', () => {
    beforeEach(() => {
      const configService = {
        get: jest.fn(),
      };
      const cartsRepository = {
        get: jest.fn(),
      };
      const cacheManager = {
        get: jest.fn(),
        set: jest.fn(),
      };
      const couponsService = {
        get: jest.fn(),
      };
      service = new CartsService(
        configService as any,
        cartsRepository as any,
        cacheManager as any,
        couponsService as any,
      );
    });

    it('should calculate totals correctly with no coupon code', async () => {
      const id = uuidv4();
      const userId = uuidv4();

      const cart: TCart = {
        id,
        userId,
        products: [
          {
            id: '1',
            name: 'Product 1',
            quantity: 2,
            price: 10,
            subTotal: 20,
            discount: 0,
          },
          {
            id: '2',
            name: 'Product 2',
            quantity: 3,
            price: 5,
            subTotal: 15,
            discount: 0,
          },
        ],
        subTotal: 35,
        discount: 0,
        total: 35,
        couponCode: null,
      };

      const result = await service.calculateTotals('context', cart, null);

      expect(result.subTotal).toBe(35);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(35);
    });

    it('should apply coupon code correctly for the first order', async () => {
      const nthOrderDiscountCount = 1;
      (service.config.get as jest.Mock).mockReturnValueOnce(nthOrderDiscountCount);

      const nthOrderCouponValue = 10;
      (service.config.get as jest.Mock).mockReturnValueOnce(nthOrderCouponValue);

      const couponValidity = 'COUPON123';

      const id = uuidv4();
      const userId = uuidv4();

      const cart: TCart = {
        id,
        userId,
        products: [
          {
            id: '1',
            name: 'Product 1',
            quantity: 2,
            price: 10,
            subTotal: 20,
            discount: 0,
          },
          {
            id: '2',
            name: 'Product 2',
            quantity: 3,
            price: 5,
            subTotal: 15,
            discount: 0,
          },
        ],
        subTotal: 35,
        discount: 0,
        total: 35,
        couponCode: 'COUPON123',
      };

      jest.spyOn(service, 'applyCoupon').mockResolvedValue({
        id,
        userId,
        products: [
          {
            id: '1',
            name: 'Product 1',
            quantity: 2,
            price: 10,
            subTotal: 20,
            discount: 2,
          },
          {
            id: '2',
            name: 'Product 2',
            quantity: 3,
            price: 5,
            subTotal: 15,
            discount: 1.5,
          },
        ],
        subTotal: 35,
        discount: 3.5,
        total: 31.5,
        couponCode: 'COUPON123',
      });

      const result = await service.calculateTotals('context', cart, 'COUPON123');

      expect(result.products[0].discount).toBe(2);
      expect(result.products[1].discount).toBe(1.5);
      expect(result.couponCode).toBe('COUPON123');
      expect(result.subTotal).toBe(35);
      expect(result.discount).toBe(3.5);
      expect(result.total).toBe(31.5);
    });

    it('should not apply coupon code if previous order count is not correct', async () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce(2);

      const id = uuidv4();
      const userId = uuidv4();

      const cart: TCart = {
        id,
        userId,
        products: [
          {
            id: '1',
            name: 'Product 1',
            quantity: 2,
            price: 10,
            subTotal: 20,
            discount: 0,
          },
          {
            id: '2',
            name: 'Product 2',
            quantity: 3,
            price: 5,
            subTotal: 15,
            discount: 0,
          },
        ],
        subTotal: 35,
        discount: 0,
        total: 35,
        couponCode: 'COUPON123',
      };

      const result = await service.calculateTotals('context', cart, 'COUPON123');

      expect(result.products[0].discount).toBe(0);
      expect(result.products[1].discount).toBe(0);
      expect(result.couponCode).toBeNull();
      expect(result.subTotal).toBe(35);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(35);
    });

    it('should not apply coupon code if nthOrderCouponValue is not defined', async () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce(1);
      jest.spyOn(configService, 'get').mockReturnValueOnce(undefined);

      const id = uuidv4();
      const userId = uuidv4();

      const cart: TCart = {
        id,
        userId,
        products: [
          {
            id: '1',
            name: 'Product 1',
            quantity: 2,
            price: 10,
            subTotal: 20,
            discount: 0,
          },
          {
            id: '2',
            name: 'Product 2',
            quantity: 3,
            price: 5,
            subTotal: 15,
            discount: 0,
          },
        ],
        subTotal: 35,
        discount: 0,
        total: 35,
        couponCode: 'COUPON123',
      };

      const result = await service.calculateTotals('context', cart, 'COUPON123');

      expect(result.products[0].discount).toBe(0);
      expect(result.products[1].discount).toBe(0);
      expect(result.couponCode).toBeNull();
      expect(result.subTotal).toBe(35);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(35);
    });

    it('should not apply coupon code if previous order count is not correct', async () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce(2);
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce('1');

      const id = uuidv4();
      const userId = uuidv4();

      const cart: TCart = {
        id,
        userId,
        products: [
          {
            id: '1',
            name: 'Product 1',
            quantity: 2,
            price: 10,
            subTotal: 20,
            discount: 0,
          },
          {
            id: '2',
            name: 'Product 2',
            quantity: 3,
            price: 5,
            subTotal: 15,
            discount: 0,
          },
        ],
        subTotal: 35,
        discount: 0,
        total: 35,
        couponCode: 'COUPON123',
      };

      const result = await service.calculateTotals('context', cart, 'COUPON123');

      expect(result.products[0].discount).toBe(0);
      expect(result.products[1].discount).toBe(0);
      expect(result.couponCode).toBeNull();
      expect(result.subTotal).toBe(35);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(35);
    });
  });
});
