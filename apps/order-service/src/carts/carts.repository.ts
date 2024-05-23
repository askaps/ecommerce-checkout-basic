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
    // Store the order in the cache with a TTL of 1 year (365 days)
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

  /**
   * Deletes a cart from the cache.
   *
   * @param {string} ctx - The context of the request.
   * @param {string} id - The id of the cart to be deleted.
   * @return {Promise<boolean>} A promise that resolves to true if the cart was deleted successfully.
   */
  async delete(ctx: string, id: string): Promise<boolean> {
    // Delete the cart from the cache
    await this.cacheManager.del(id);
    return true;
  }
}
