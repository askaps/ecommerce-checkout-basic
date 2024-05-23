import { Inject, Injectable } from '@nestjs/common';
import { Cart, TCart } from './entities/cart.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CartsRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Creates a new cart with the provided data and stores it in the cache.
   *
   * @param {string} ctx - The context of the request.
   * @param id - The id of the cart
   * @param {Partial<Cart>} request - The data for the new cart.
   * @return {Promise<TCart>} - A promise that resolves to the newly created cart.
   */
  async create(ctx: string, request: Partial<TCart>): Promise<TCart> {
    await this.cacheManager.set(request.id, request, 365 * 3600 * 1000);
    return await this.get(ctx, request.id);
  }

  /**
   * Get the cart from the cache
   *
   * @param ctx - The context of the request
   * @param id - The id of the cart
   *
   * @returns The cart as a TCart
   */
  async get(ctx: string, id: string): Promise<TCart> {
    return await this.cacheManager.get(id);
  }

  /**
   * Updates the cart with the provided data in the cache and retrieves the updated cart.
   *
   * @param {string} ctx - The context of the request.
   * @param {string} id - The id of the cart to be updated.
   * @param {UpdateCartDto} request - The data to update the cart with.
   * @return {Promise<TCart>} A promise that resolves to the updated cart.
   */
  async update(ctx: string, id: string, request: Partial<Cart>): Promise<TCart> {
    await this.cacheManager.set(id, request, 365 * 3600 * 1000);
    return await this.get(ctx, id);
  }
}
