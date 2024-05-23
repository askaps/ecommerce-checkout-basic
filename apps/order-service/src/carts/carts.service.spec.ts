import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { CartsRepository } from './carts.repository';
import { v4 as uuidv4 } from 'uuid';
import { UnauthorizedException } from '@nestjs/common';
import { TCart } from './entities/cart.entity';
import { ConfigService } from '@nestjs/config';

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
});
