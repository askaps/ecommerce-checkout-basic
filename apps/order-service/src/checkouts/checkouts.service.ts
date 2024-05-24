import { HttpStatus, Injectable } from '@nestjs/common';
import { CheckedException, LoggerModule } from '@app/shared';
import { ConfigService } from '@nestjs/config';
import { CheckoutsRepository } from './checkouts.repository';
import { TOrder } from './entities/order.entity';
import { v4 as uuidv4 } from 'uuid';
import { CartsService } from '../carts/carts.service';

@Injectable()
export class CheckoutsService {
  private logger = new LoggerModule(CheckoutsService.name);

  constructor(
    readonly config: ConfigService,
    private readonly repository: CheckoutsRepository,
    private readonly cartsService: CartsService,
  ) {}

  /**
   * Creates a new order with the provided context and user ID.
   *
   * @param ctx - The context of the request.
   * @param userId - The ID of the user creating the order.
   * @returns A promise that resolves to the newly created order.
   */
  async create(ctx: string, userId: string, cartId: string): Promise<TOrder> {
    try {
      const cart = await this.cartsService.get(ctx, userId, cartId);

      let order: TOrder = { ...cart, id: `order_${uuidv4()}` };

      // Create a new order in the repository
      this.logger.info(ctx, `Creating new order with payload: ${JSON.stringify(order)}`);
      order = await this.repository.create(ctx, order);

      // Delete the cart
      this.logger.info(ctx, `Deleting cart with id: ${cartId}`);
      this.cartsService.delete(ctx, cartId);

      // TODO: Delete used coupon
      // commented because want to show coupons
      // if (cart.couponCode) {
      // this.logger.info(ctx, `Deleting couponCode: ${cart.couponCode}`);
      // await this.couponsService.delete(ctx, cart.couponCode);
      // }

      return order;
    } catch (error) {
      throw new CheckedException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, ctx);
    }
  }

  /**
   * Retrieves all orders from the repository.
   *
   * @param ctx - The context of the request.
   * @returns A promise that resolves to an array of orders.
   * @throws If there is an error retrieving the orders.
   */
  async getAll(ctx: string): Promise<TOrder[]> {
    try {
      // Retrieve all orders from the repository
      return await this.repository.getAll(ctx);
    } catch (error) {
      throw new CheckedException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, ctx);
    }
  }
}
