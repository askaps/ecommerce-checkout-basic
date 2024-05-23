import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { CartsRepository } from './carts.repository';
import { v4 as uuidv4 } from 'uuid';
import { UnauthorizedException } from '@nestjs/common';
import { TCart } from './entities/cart.entity';
import { ConfigService } from '@nestjs/config';
import { CheckedException } from '@app/shared';

describe('CartsService', () => {
  let service: CartsService;
  let repository: CartsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        CartsService,
        {
          provide: CartsRepository,
          useValue: {
            get: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    repository = module.get<CartsRepository>(CartsRepository);
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

      const expectedCart = { ...cart, discount: 2, subTotal: 20, total: 18 };

      repository.get = jest.fn().mockResolvedValue(cart);
      repository.update = jest.fn().mockResolvedValue(expectedCart);

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
    let cartsService: CartsService;

    beforeEach(() => {
      const configService = {
        get: jest.fn(),
      };
      const cartsRepository = {
        findOne: jest.fn(),
      };
      cartsService = new CartsService(configService as any, cartsRepository as any);
    });

    it('should calculate totals correctly with no coupon code', async () => {
      // Arrange
      const ctx = 'test context';
      const id = uuidv4();
      const userId = uuidv4();

      const cart: TCart = {
        id,
        userId,
        products: [
          {
            id: 'product1',
            name: 'Product 1',
            quantity: 2,
            price: 10,
            subTotal: 20,
            discount: 0,
          },
          {
            id: 'product2',
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

      // Act
      const result = await cartsService.calculateTotals(ctx, cart, null);

      // Assert
      expect(result).toEqual({
        id,
        userId,
        products: [
          {
            id: 'product1',
            name: 'Product 1',
            quantity: 2,
            price: 10,
            subTotal: 20,
            discount: 0,
          },
          {
            id: 'product2',
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
      });
    });

    it('should calculate totals correctly with a coupon code', async () => {
      // Arrange
      const ctx = 'test context';
      const id = uuidv4();
      const userId = uuidv4();
      const couponCode = 'DISCOUNT10';
      const nthOrderCouponValue = 10;
      (cartsService.config.get as jest.Mock).mockReturnValueOnce(nthOrderCouponValue);

      const cart: TCart = {
        id,
        userId,
        products: [
          {
            id: 'product1',
            name: 'Product 1',
            quantity: 2,
            price: 10,
            subTotal: 20,
            discount: 0,
          },
          {
            id: 'product2',
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
        couponCode,
      };

      // Act
      const result = await cartsService.calculateTotals(ctx, cart, couponCode);

      // Assert
      expect(result).toEqual({
        id,
        userId,
        products: [
          {
            id: 'product1',
            name: 'Product 1',
            quantity: 2,
            price: 10,
            subTotal: 20,
            discount: 2,
          },
          {
            id: 'product2',
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
        couponCode: 'DISCOUNT10',
      });
    });

    it('should calculate totals correctly with no products', async () => {
      // Arrange
      const ctx = 'test context';
      const id = uuidv4();
      const userId = uuidv4();

      const cart: TCart = {
        id,
        userId,
        products: [],
        subTotal: 0,
        discount: 0,
        total: 0,
        couponCode: null,
      };

      // Act
      const result = await cartsService.calculateTotals(ctx, cart, null);

      // Assert
      expect(result).toEqual({
        id,
        userId,
        products: [],
        subTotal: 0,
        discount: 0,
        total: 0,
        couponCode: null,
      });
    });
  });
});
