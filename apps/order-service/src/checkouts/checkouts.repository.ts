import { Inject, Injectable } from '@nestjs/common';
import { TOrder } from './entities/order.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CheckoutsRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Creates a new order with the provided data and stores it in the cache.
   *
   * @param {string} ctx - The context of the request.
   * @param {TOrder} request - The data for the new order.
   * @return {Promise<TOrder>} A promise that resolves to the newly created order.
   */
  async create(ctx: string, request: TOrder): Promise<TOrder> {
    // Store the order in the cache with a TTL of 1 year (365 days)
    await this.cacheManager.set(request.id, request, 365 * 3600 * 1000);

    // mock function to increment order count for coupon usage
    await this.incrementOrderCount(ctx);

    return await this.get(ctx, request.id);
  }

  /**
   * Retrieves an order from the cache by its id.
   *
   * @param {string} ctx - The context of the request.
   * @param {string} id - The id of the order to retrieve.
   * @return {Promise<TOrder>} A promise that resolves to the order with the
   * given id.
   */
  async get(ctx: string, id: string): Promise<TOrder> {
    return await this.cacheManager.get(id);
  }

  /**
   * [IMPORTANT] Mock function only: coupon rule engine should actually work on database order counts
   * Increments the order count in the cache.
   *
   * @param {string} ctx - The context of the request.
   * @return {Promise<number>} A promise that resolves to the incremented order count.
   */
  async incrementOrderCount(ctx: string): Promise<number> {
    let orderCount = parseInt(await this.cacheManager.get('orderCount')) || 0;

    orderCount++;

    // Store the updated order count back in the cache with a TTL of 1 year (365 days).
    await this.cacheManager.set('orderCount', orderCount, 365 * 3600 * 1000);

    return orderCount;
  }
}
