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
    // Get the list of orders from the cache. If it doesn't exist, create an empty array.
    // Replicating database table
    const orders: TOrder[] = (await this.cacheManager.get('orders')) || [];

    // Add the new coupon code to the array.
    // Replicating insert
    orders.push(request);

    // Store the updated list of coupons in the cache with a TTL of 1 year (365 days).
    await this.cacheManager.set('orders', orders, 365 * 3600 * 1000);

    // mock function to increment order count for coupon usage
    await this.incrementOrderCount(ctx);

    return request;
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

  /**
   * Retrieves all orders from the cache.
   *
   * @param {string} ctx - The context of the request.
   * @return {Promise<TOrder[]>} A promise that resolves to an array of orders.
   */
  async getAll(ctx: string): Promise<TOrder[]> {
    return (await this.cacheManager.get('orders')) || [];
  }
}
