import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutsService } from './checkouts.service';
import { CartsService } from '../carts/carts.service';
import { CheckoutsRepository } from './checkouts.repository';
import { CartsRepository } from '../carts/carts.repository';
import { TCart } from '../carts/entities/cart.entity';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

describe('CheckoutsService', () => {
  let service: CheckoutsService;
  let cartsService: CartsService;
  let checkoutsRepository: CheckoutsRepository;

  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        CheckoutsService,
        {
          provide: CartsService,
          useValue: {
            get: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CheckoutsRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: CartsRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CheckoutsService>(CheckoutsService);
    cartsService = module.get<CartsService>(CartsService);
    checkoutsRepository = module.get<CheckoutsRepository>(CheckoutsRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should create a new order with the provided context and user ID', async () => {
    const ctx = 'test-context';
    const cartId = uuidv4();
    const userId = uuidv4();

    const cart: TCart = {
      id: cartId,
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

    const orderId = '123456789';
    const order = { ...cart, id: orderId };

    jest.mock('uuid', () => ({ v4: () => orderId }));
    jest.spyOn(cartsService, 'get').mockResolvedValue(cart);
    jest.spyOn(checkoutsRepository, 'create').mockResolvedValue(order);

    const result = await service.create(ctx, userId, cartId);

    expect(cartsService.get).toHaveBeenCalledWith(ctx, userId, cartId);
    expect(result).toEqual(order);
  });
});
